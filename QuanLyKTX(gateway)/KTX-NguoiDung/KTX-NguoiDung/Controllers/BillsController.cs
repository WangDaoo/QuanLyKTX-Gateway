using Microsoft.AspNetCore.Mvc;
using KTX_NguoiDung.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_NguoiDung.Controllers
{
    [ApiController]
    [Route("api/bills")]
    [Authorize(Roles = "Student")]
    public class BillsController : ControllerBase
    {
        private readonly string _connectionString;

        public BillsController(IConfiguration configuration)
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

                using var command = new SqlCommand("sp_HoaDon_GetBySinhVien", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaSinhVien", maSinhVien);

                using var reader = await command.ExecuteReaderAsync();
                var bills = new List<HoaDon>();
                while (await reader.ReadAsync())
                {
                    bills.Add(new HoaDon
                    {
                        MaHoaDon = reader.GetInt32("MaHoaDon"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        MaPhong = reader.IsDBNull("MaPhong") ? null : reader.GetInt32("MaPhong"),
                        MaHopDong = reader.IsDBNull("MaHopDong") ? null : reader.GetInt32("MaHopDong"),
                        Thang = reader.GetInt32("Thang"),
                        Nam = reader.GetInt32("Nam"),
                        TongTien = reader.GetDecimal("TongTien"),
                        TrangThai = reader.GetString("TrangThai"),
                        HanThanhToan = reader.IsDBNull("HanThanhToan") ? (DateTime?)null : reader.GetDateTime("HanThanhToan"),
                        NgayThanhToan = reader.IsDBNull("NgayThanhToan") ? (DateTime?)null : reader.GetDateTime("NgayThanhToan"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }
                return Ok(new { success = true, data = bills });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("my/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var (maSinhVien, errorMessage) = GetCurrentStudentId();
                if (maSinhVien == null)
                    return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin người dùng" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_HoaDon_GetById", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaHoaDon", id);

                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    var bill = new HoaDon
                    {
                        MaHoaDon = reader.GetInt32("MaHoaDon"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        MaPhong = reader.IsDBNull("MaPhong") ? null : reader.GetInt32("MaPhong"),
                        MaHopDong = reader.IsDBNull("MaHopDong") ? null : reader.GetInt32("MaHopDong"),
                        Thang = reader.GetInt32("Thang"),
                        Nam = reader.GetInt32("Nam"),
                        TongTien = reader.GetDecimal("TongTien"),
                        TrangThai = reader.GetString("TrangThai"),
                        HanThanhToan = reader.IsDBNull("HanThanhToan") ? (DateTime?)null : reader.GetDateTime("HanThanhToan"),
                        NgayThanhToan = reader.IsDBNull("NgayThanhToan") ? (DateTime?)null : reader.GetDateTime("NgayThanhToan"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };

                    // Kiểm tra xem hóa đơn có thuộc về sinh viên hiện tại không
                    if (bill.MaSinhVien != maSinhVien)
                    {
                        return Forbid();
                    }

                    return Ok(new { success = true, data = bill });
                }

                return NotFound(new { success = false, message = "Không tìm thấy hóa đơn" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("my/{id:int}/details")]
        public async Task<IActionResult> GetBillDetails(int id)
        {
            try
            {
                var (maSinhVien, errorMessage) = GetCurrentStudentId();
                if (maSinhVien == null)
                    return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin người dùng" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                // Kiểm tra hóa đơn có thuộc về sinh viên không
                using var checkCommand = new SqlCommand("sp_HoaDon_GetById", connection) { CommandType = CommandType.StoredProcedure };
                checkCommand.Parameters.AddWithValue("@MaHoaDon", id);

                using var checkReader = await checkCommand.ExecuteReaderAsync();
                if (!await checkReader.ReadAsync())
                {
                    return NotFound(new { success = false, message = "Không tìm thấy hóa đơn" });
                }

                var billMaSinhVien = checkReader.GetInt32("MaSinhVien");
                checkReader.Close();

                if (billMaSinhVien != maSinhVien)
                {
                    return Forbid();
                }

                // Lấy chi tiết hóa đơn
                using var command = new SqlCommand("sp_ChiTietHoaDon_GetByHoaDon", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaHoaDon", id);

                using var reader = await command.ExecuteReaderAsync();
                var details = new List<ChiTietHoaDon>();
                while (await reader.ReadAsync())
                {
                    details.Add(new ChiTietHoaDon
                    {
                        MaChiTiet = reader.GetInt32("MaChiTiet"),
                        MaHoaDon = reader.GetInt32("MaHoaDon"),
                        LoaiChiPhi = reader.GetString("LoaiChiPhi"),
                        SoLuong = reader.GetInt32("SoLuong"),
                        DonGia = reader.GetDecimal("DonGia"),
                        ThanhTien = reader.GetDecimal("ThanhTien"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = details });
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


