using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using KTX_NguoiDung.Models;
using KTX_NguoiDung.Models.Responses;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Security.Claims;

namespace KTX_NguoiDung.Controllers
{
    [ApiController]
    [Route("api/registrations")]
    [Authorize(Roles = "Student")]
    public class RegistrationController : ControllerBase
    {
        private readonly string _connectionString;

        public RegistrationController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("KTX") ?? throw new ArgumentNullException(nameof(configuration));
        }

        private static DonDangKyResponse MapRegistration(SqlDataReader reader)
        {
            return new DonDangKyResponse
            {
                MaDon = reader.GetInt32("MaDon"),
                MaSinhVien = reader.GetInt32("MaSinhVien"),
                MaPhongDeXuat = reader.IsDBNull("MaPhongDeXuat") ? (int?)null : reader.GetInt32("MaPhongDeXuat"),
                TrangThai = reader.GetString("TrangThai"),
                LyDo = reader.IsDBNull("LyDo") ? null : reader.GetString("LyDo"),
                NgayDangKy = reader.GetDateTime("NgayDangKy"),
                GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                IsDeleted = reader.GetBoolean("IsDeleted"),
                NgayTao = reader.GetDateTime("NgayTao"),
                NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat"),
                TenSinhVien = reader.IsDBNull("TenSinhVien") ? null : reader.GetString("TenSinhVien"),
                MSSV = reader.IsDBNull("MSSV") ? null : reader.GetString("MSSV"),
                PhongDeXuat = reader.IsDBNull("PhongDeXuat") ? null : reader.GetString("PhongDeXuat"),
                ToaNhaDeXuat = reader.IsDBNull("ToaNhaDeXuat") ? null : reader.GetString("ToaNhaDeXuat")
            };
        }

        [HttpGet("my-registrations")]
        public async Task<IActionResult> GetMyRegistrations()
        {
            try
            {
                var (studentId, errorMessage) = GetCurrentStudentId();
                if (studentId == null)
                    return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin sinh viên" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_DonDangKy_GetBySinhVien", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@MaSinhVien", studentId);

                using var reader = await command.ExecuteReaderAsync();
                var registrations = new List<DonDangKyResponse>();
                
                while (await reader.ReadAsync())
                {
                    registrations.Add(MapRegistration(reader));
                }

                return Ok(new { success = true, data = registrations });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRegistrationRequest request)
        {
            try
            {
                var (studentId, errorMessage) = GetCurrentStudentId();
                if (studentId == null)
                    return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin sinh viên" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_DonDangKy_Create", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@MaSinhVien", studentId);
                command.Parameters.AddWithValue("@MaPhongDeXuat", (object?)request.MaPhongDeXuat ?? DBNull.Value);
                command.Parameters.AddWithValue("@LyDo", (object?)request.LyDo ?? DBNull.Value);
                command.Parameters.AddWithValue("@NgayDangKy", DateTime.Now.Date);
                command.Parameters.AddWithValue("@GhiChu", (object?)request.GhiChu ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiTao", (object?)User.FindFirst("MaTaiKhoan")?.Value ?? DBNull.Value);

                var maDon = await command.ExecuteScalarAsync();
                
                if (maDon != null && maDon != DBNull.Value)
                {
                    // Fetch lại registration sau khi tạo để trả về data
                    using var getCommand = new SqlCommand("sp_DonDangKy_GetById", connection) { CommandType = CommandType.StoredProcedure };
                    getCommand.Parameters.AddWithValue("@MaDon", Convert.ToInt32(maDon));
                    using var reader = await getCommand.ExecuteReaderAsync();
                    
                    if (await reader.ReadAsync())
                    {
                        var registration = MapRegistration(reader);
                        return Ok(new { success = true, data = registration, message = "Tạo đơn đăng ký thành công" });
                    }
                    return Ok(new { success = true, message = "Tạo đơn đăng ký thành công" });
                }

                return BadRequest(new { success = false, message = "Không thể tạo đơn đăng ký" });
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

    public class CreateRegistrationRequest
    {
        public int? MaPhongDeXuat { get; set; }
        public string? LyDo { get; set; }
        public string? GhiChu { get; set; }
    }
}