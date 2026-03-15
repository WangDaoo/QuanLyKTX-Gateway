using Microsoft.AspNetCore.Mvc;
using KTX_NguoiDung.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Security.Claims;

namespace KTX_NguoiDung.Controllers
{
    [ApiController]
    [Route("api/contracts")]
    [Authorize(Roles = "Student")]
    public class ContractsController : ControllerBase
    {
        private readonly string _connectionString;

        public ContractsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("KTX") ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpGet("my")]
        public async Task<IActionResult> My()
        {
            try
            {
                var (maSinhVien, errorMessage) = GetCurrentStudentId();
                if (maSinhVien == null)
                    return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin người dùng" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_HopDong_GetBySinhVien", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaSinhVien", maSinhVien);

                using var reader = await command.ExecuteReaderAsync();
                var contracts = new List<HopDong>();
                while (await reader.ReadAsync())
                {
                    contracts.Add(new HopDong
                    {
                        MaHopDong = reader.GetInt32("MaHopDong"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        MaGiuong = reader.GetInt32("MaGiuong"),
                        NgayBatDau = reader.GetDateTime("NgayBatDau"),
                        NgayKetThuc = reader.GetDateTime("NgayKetThuc"),
                        GiaPhong = reader.GetDecimal("GiaPhong"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }
                return Ok(new { success = true, data = contracts });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("my/current")]
        public async Task<IActionResult> GetCurrent()
        {
            try
            {
                var (maSinhVien, errorMessage) = GetCurrentStudentId();
                if (maSinhVien == null)
                    return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin người dùng" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_HopDong_GetBySinhVien", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaSinhVien", maSinhVien);

                using var reader = await command.ExecuteReaderAsync();
                var today = DateTime.Now.Date;
                
                while (await reader.ReadAsync())
                {
                    var ngayBatDau = reader.GetDateTime("NgayBatDau").Date;
                    var ngayKetThuc = reader.GetDateTime("NgayKetThuc").Date;
                    var trangThai = reader.GetString("TrangThai");
                    
                    // Kiểm tra hợp đồng có hiệu lực: TrangThai = "Có hiệu lực" và ngày hiện tại nằm trong khoảng
                    if (trangThai == "Có hiệu lực" && today >= ngayBatDau && today <= ngayKetThuc)
                    {
                        var contract = new HopDong
                        {
                            MaHopDong = reader.GetInt32("MaHopDong"),
                            MaSinhVien = reader.GetInt32("MaSinhVien"),
                            MaGiuong = reader.GetInt32("MaGiuong"),
                            NgayBatDau = reader.GetDateTime("NgayBatDau"),
                            NgayKetThuc = reader.GetDateTime("NgayKetThuc"),
                            GiaPhong = reader.GetDecimal("GiaPhong"),
                            TrangThai = reader.GetString("TrangThai"),
                            GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                            IsDeleted = reader.GetBoolean("IsDeleted"),
                            NgayTao = reader.GetDateTime("NgayTao"),
                            NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                            NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                            NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                        };
                        return Ok(new { success = true, data = contract });
                    }
                }
                
                return NotFound(new { success = false, message = "Không tìm thấy hợp đồng hiện tại" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("my/{id:int}/confirm")]
        public async Task<IActionResult> ConfirmContract(int id)
        {
            try
            {
                var (maSinhVien, errorMessage) = GetCurrentStudentId();
                if (maSinhVien == null)
                    return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin người dùng" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                // Kiểm tra hợp đồng có thuộc về sinh viên này không và đang ở trạng thái "Chờ duyệt"
                using var checkCommand = new SqlCommand("SELECT MaHopDong, TrangThai FROM HopDong WHERE MaHopDong = @MaHopDong AND MaSinhVien = @MaSinhVien AND IsDeleted = 0", connection);
                checkCommand.Parameters.AddWithValue("@MaHopDong", id);
                checkCommand.Parameters.AddWithValue("@MaSinhVien", maSinhVien);

                using var checkReader = await checkCommand.ExecuteReaderAsync();
                if (!await checkReader.ReadAsync())
                {
                    return NotFound(new { success = false, message = "Không tìm thấy hợp đồng hoặc hợp đồng không thuộc về bạn" });
                }

                var currentStatus = checkReader.GetString("TrangThai");
                if (currentStatus != "Chờ duyệt")
                {
                    return BadRequest(new { success = false, message = $"Hợp đồng đã ở trạng thái '{currentStatus}', không thể xác nhận" });
                }

                checkReader.Close();

                // Sử dụng stored procedure sp_HopDong_Confirm để xác nhận hợp đồng
                // SP này sẽ cập nhật trạng thái hợp đồng thành "Có hiệu lực" và cập nhật cả Giuong và Phong
                using var confirmCommand = new SqlCommand("sp_HopDong_Confirm", connection) { CommandType = CommandType.StoredProcedure };
                confirmCommand.Parameters.AddWithValue("@MaHopDong", id);
                confirmCommand.Parameters.AddWithValue("@NguoiCapNhat", User.FindFirst("MaTaiKhoan")?.Value ?? "Student");

                try
                {
                    await confirmCommand.ExecuteNonQueryAsync();

                    // Fetch lại hợp đồng sau khi xác nhận
                    using var getCommand = new SqlCommand("sp_HopDong_GetById", connection) { CommandType = CommandType.StoredProcedure };
                    getCommand.Parameters.AddWithValue("@MaHopDong", id);

                    using var reader = await getCommand.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        var contract = new HopDong
                        {
                            MaHopDong = reader.GetInt32("MaHopDong"),
                            MaSinhVien = reader.GetInt32("MaSinhVien"),
                            MaGiuong = reader.GetInt32("MaGiuong"),
                            NgayBatDau = reader.GetDateTime("NgayBatDau"),
                            NgayKetThuc = reader.GetDateTime("NgayKetThuc"),
                            GiaPhong = reader.GetDecimal("GiaPhong"),
                            TrangThai = reader.GetString("TrangThai"),
                            GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                            IsDeleted = reader.GetBoolean("IsDeleted"),
                            NgayTao = reader.GetDateTime("NgayTao"),
                            NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                            NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                            NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                        };
                        return Ok(new { success = true, data = contract, message = "Xác nhận hợp đồng thành công. Hợp đồng đã có hiệu lực." });
                    }
                    return Ok(new { success = true, message = "Xác nhận hợp đồng thành công" });
                }
                catch (SqlException sqlEx)
                {
                    // Xử lý lỗi từ stored procedure (RAISERROR)
                    if (sqlEx.Number == 50000)
                    {
                        return BadRequest(new { success = false, message = sqlEx.Message });
                    }
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        private (int? studentId, string? errorMessage) GetCurrentStudentId()
        {
            var userId = User.FindFirst("MaTaiKhoan")?.Value;
            if (string.IsNullOrEmpty(userId))
                return (null, "Token không hợp lệ hoặc không có thông tin người dùng");

            try
            {
                using var connection = new SqlConnection(_connectionString);
                connection.Open();

                // Lấy MaSinhVien từ TaiKhoan (nghiệp vụ: tài khoản Student PHẢI có MaSinhVien)
                using var command = new SqlCommand("SELECT MaSinhVien, VaiTro FROM TaiKhoan WHERE MaTaiKhoan = @MaTaiKhoan AND IsDeleted = 0", connection);
                command.Parameters.AddWithValue("@MaTaiKhoan", Convert.ToInt32(userId));

                using var reader = command.ExecuteReader();
                if (!reader.Read())
                    return (null, "Tài khoản không tồn tại hoặc đã bị xóa");
                
                var vaiTro = reader.IsDBNull("VaiTro") ? null : reader.GetString("VaiTro");
                if (vaiTro != "Student")
                    return (null, "Tài khoản không phải là sinh viên");
                
                var maSinhVien = reader.IsDBNull("MaSinhVien") ? (int?)null : reader.GetInt32("MaSinhVien");
                
                if (maSinhVien == null)
                    return (null, "Tài khoản sinh viên chưa được liên kết với thông tin sinh viên"); // Nghiệp vụ: Student phải có MaSinhVien
                
                reader.Close();
                
                // Validate SinhVien tồn tại và không bị xóa (nghiệp vụ: đảm bảo tính hợp lệ)
                using var validateCommand = new SqlCommand("SELECT 1 FROM SinhVien WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0", connection);
                validateCommand.Parameters.AddWithValue("@MaSinhVien", maSinhVien.Value);
                var isValid = validateCommand.ExecuteScalar();
                
                if (isValid == null)
                    return (null, "Thông tin sinh viên không tồn tại hoặc đã bị xóa");
                
                return (maSinhVien.Value, null);
            }
            catch (Exception ex)
            {
                return (null, $"Lỗi hệ thống: {ex.Message}");
            }
        }
    }
}


