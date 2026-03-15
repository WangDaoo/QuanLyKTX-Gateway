using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using KTX_NguoiDung.Models;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Security.Claims;

namespace KTX_NguoiDung.Controllers
{
    [ApiController]
    [Route("api/change-requests")] 
    [Authorize(Roles = "Student")]
    public class ChangeRequestsController : ControllerBase
    {
        private readonly string _connectionString;

        public ChangeRequestsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("KTX") ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpGet("my-requests")]
        public async Task<IActionResult> GetMyRequests()
        {
            try
            {
                var (studentId, errorMessage) = GetCurrentStudentId();
                if (studentId == null)
                    return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin sinh viên" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_YeuCauChuyenPhong_GetBySinhVien", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@MaSinhVien", studentId);

                using var reader = await command.ExecuteReaderAsync();
                var requests = new List<object>();
                
                while (await reader.ReadAsync())
                {
                    requests.Add(new
                    {
                        MaYeuCau = reader.GetInt32("MaYeuCau"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        PhongHienTai = reader.GetInt32("PhongHienTai"),
                        PhongMongMuon = reader.IsDBNull("PhongMongMuon") ? (int?)null : reader.GetInt32("PhongMongMuon"),
                        LyDo = reader.IsDBNull("LyDo") ? null : reader.GetString("LyDo"),
                        NgayYeuCau = reader.GetDateTime("NgayYeuCau"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = requests });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateChangeRequestRequest request)
        {
            try
            {
                var (studentId, errorMessage) = GetCurrentStudentId();
                if (studentId == null)
                    return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin sinh viên" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_YeuCauChuyenPhong_Create", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@MaSinhVien", studentId);
                command.Parameters.AddWithValue("@PhongHienTai", request.PhongHienTai);
                command.Parameters.AddWithValue("@PhongMongMuon", (object?)request.PhongMongMuon ?? DBNull.Value);
                command.Parameters.AddWithValue("@LyDo", request.LyDo ?? string.Empty);
                command.Parameters.AddWithValue("@NgayYeuCau", DateTime.Now.Date);
                command.Parameters.AddWithValue("@GhiChu", (object?)request.GhiChu ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiTao", (object?)User.FindFirst("MaTaiKhoan")?.Value ?? DBNull.Value);

                var maYeuCau = await command.ExecuteScalarAsync();
                
                if (maYeuCau != null && maYeuCau != DBNull.Value)
                {
                    // Fetch lại change request sau khi tạo để trả về data
                    using var getCommand = new SqlCommand("sp_YeuCauChuyenPhong_GetById", connection) { CommandType = CommandType.StoredProcedure };
                    getCommand.Parameters.AddWithValue("@MaYeuCau", Convert.ToInt32(maYeuCau));
                    using var reader = await getCommand.ExecuteReaderAsync();
                    
                    if (await reader.ReadAsync())
                    {
                        var changeRequest = new
                        {
                            MaYeuCau = reader.GetInt32("MaYeuCau"),
                            MaSinhVien = reader.GetInt32("MaSinhVien"),
                            PhongHienTai = reader.GetInt32("PhongHienTai"),
                            PhongMongMuon = reader.IsDBNull("PhongMongMuon") ? (int?)null : reader.GetInt32("PhongMongMuon"),
                            LyDo = reader.GetString("LyDo"),
                            NgayYeuCau = reader.GetDateTime("NgayYeuCau"),
                            TrangThai = reader.GetString("TrangThai"),
                            GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                            IsDeleted = reader.GetBoolean("IsDeleted"),
                            NgayTao = reader.GetDateTime("NgayTao"),
                            NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                            NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                            NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                        };
                        return Ok(new { success = true, data = changeRequest, message = "Tạo yêu cầu chuyển phòng thành công" });
                    }
                    return Ok(new { success = true, message = "Tạo yêu cầu chuyển phòng thành công" });
                }

                return BadRequest(new { success = false, message = "Không thể tạo yêu cầu" });
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

    public class CreateChangeRequestRequest
    {
        public int PhongHienTai { get; set; }
        public int? PhongMongMuon { get; set; }
        public string? LyDo { get; set; }
        public string? GhiChu { get; set; }
    }
}