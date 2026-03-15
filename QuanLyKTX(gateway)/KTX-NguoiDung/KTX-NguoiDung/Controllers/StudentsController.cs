using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Security.Claims;
using KTX_NguoiDung.Models;
using BCrypt.Net;

namespace KTX_NguoiDung.Controllers
{
    [ApiController]
    [Route("api/students")]
    [Authorize(Roles = "Student")]
    public class StudentsController : ControllerBase
    {
        private readonly string _connectionString;

        public StudentsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("KTX") ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = User.FindFirst("MaTaiKhoan")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin người dùng" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_SinhVien_GetByTaiKhoan", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@MaTaiKhoan", Convert.ToInt32(userId));

                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    var profile = new
                    {
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        HoTen = reader.GetString("HoTen"),
                        MSSV = reader.IsDBNull("MSSV") ? null : reader.GetString("MSSV"),
                        NgaySinh = reader.IsDBNull("NgaySinh") ? (DateTime?)null : reader.GetDateTime("NgaySinh"),
                        GioiTinh = reader.IsDBNull("GioiTinh") ? null : reader.GetString("GioiTinh"),
                        SDT = reader.IsDBNull("SDT") ? null : reader.GetString("SDT"),
                        Email = reader.IsDBNull("Email") ? null : reader.GetString("Email"),
                        DiaChi = reader.IsDBNull("DiaChi") ? null : reader.GetString("DiaChi"),
                        AnhDaiDien = reader.IsDBNull("AnhDaiDien") ? null : reader.GetString("AnhDaiDien"),
                        Lop = reader.IsDBNull("Lop") ? null : reader.GetString("Lop"),
                        Khoa = reader.IsDBNull("Khoa") ? null : reader.GetString("Khoa"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        MaPhong = reader.IsDBNull("MaPhong") ? (int?)null : reader.GetInt32("MaPhong"),
                        SoPhong = reader.IsDBNull("SoPhong") ? null : reader.GetString("SoPhong"),
                        TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha")
                    };
                    return Ok(new { success = true, data = profile });
                }

                return NotFound(new { success = false, message = "Không tìm thấy thông tin sinh viên" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                var userId = User.FindFirst("MaTaiKhoan")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin người dùng" });

                // Lấy MaSinhVien từ MaTaiKhoan
                var (studentId, errorMessage) = GetCurrentStudentId();
                if (studentId == null)
                    return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin sinh viên" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                // Validate HoTen is not empty
                if (string.IsNullOrWhiteSpace(request.HoTen))
                {
                    return BadRequest(new { success = false, message = "Họ tên không được để trống" });
                }

                using var command = new SqlCommand("sp_SinhVien_UpdateProfile", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@MaSinhVien", studentId);
                command.Parameters.AddWithValue("@HoTen", request.HoTen.Trim());
                command.Parameters.AddWithValue("@NgaySinh", (object?)request.NgaySinh ?? DBNull.Value);
                command.Parameters.AddWithValue("@GioiTinh", (object?)request.GioiTinh ?? DBNull.Value);
                command.Parameters.AddWithValue("@SDT", (object?)request.SDT ?? DBNull.Value);
                command.Parameters.AddWithValue("@Email", (object?)request.Email ?? DBNull.Value);
                command.Parameters.AddWithValue("@DiaChi", (object?)request.DiaChi ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiCapNhat", (object?)User.FindFirst("MaTaiKhoan")?.Value ?? DBNull.Value);

                var result = await command.ExecuteNonQueryAsync();
                
                // Kiểm tra xem sinh viên có tồn tại không
                using var checkCommand = new SqlCommand("SELECT COUNT(*) FROM SinhVien WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0", connection);
                checkCommand.Parameters.AddWithValue("@MaSinhVien", studentId);
                var exists = (int)await checkCommand.ExecuteScalarAsync();
                
                if (exists == 0)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy thông tin sinh viên" });
                }
                
                // Nếu result >= 0 (có thể là 0 nếu dữ liệu không thay đổi hoặc > 0 nếu đã cập nhật)
                // Luôn fetch lại profile để trả về data mới nhất
                using var getCommand = new SqlCommand("sp_SinhVien_GetByTaiKhoan", connection);
                getCommand.CommandType = CommandType.StoredProcedure;
                getCommand.Parameters.AddWithValue("@MaTaiKhoan", Convert.ToInt32(userId));

                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedProfile = new
                    {
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        HoTen = reader.GetString("HoTen"),
                        MSSV = reader.IsDBNull("MSSV") ? null : reader.GetString("MSSV"),
                        NgaySinh = reader.IsDBNull("NgaySinh") ? (DateTime?)null : reader.GetDateTime("NgaySinh"),
                        GioiTinh = reader.IsDBNull("GioiTinh") ? null : reader.GetString("GioiTinh"),
                        SDT = reader.IsDBNull("SDT") ? null : reader.GetString("SDT"),
                        Email = reader.IsDBNull("Email") ? null : reader.GetString("Email"),
                        DiaChi = reader.IsDBNull("DiaChi") ? null : reader.GetString("DiaChi"),
                        AnhDaiDien = reader.IsDBNull("AnhDaiDien") ? null : reader.GetString("AnhDaiDien"),
                        Lop = reader.IsDBNull("Lop") ? null : reader.GetString("Lop"),
                        Khoa = reader.IsDBNull("Khoa") ? null : reader.GetString("Khoa"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        MaPhong = reader.IsDBNull("MaPhong") ? (int?)null : reader.GetInt32("MaPhong"),
                        SoPhong = reader.IsDBNull("SoPhong") ? null : reader.GetString("SoPhong"),
                        TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha")
                    };
                    
                    // Nếu result = 0, có thể dữ liệu không thay đổi, nhưng vẫn trả về success
                    var message = result > 0 ? "Cập nhật thông tin cá nhân thành công" : "Thông tin đã được cập nhật (không có thay đổi)";
                    return Ok(new { success = true, data = updatedProfile, message = message });
                }
                
                return Ok(new { success = true, message = "Cập nhật thông tin cá nhân thành công" });
            }
            catch (SqlException sqlEx)
            {
                // Kiểm tra lỗi CHECK constraint cho số điện thoại
                if (sqlEx.Message.Contains("CK_SinhVien_PhoneFormat"))
                {
                    return BadRequest(new { success = false, message = "Số điện thoại không đúng định dạng. Vui lòng nhập số bắt đầu bằng 0 (10 số) hoặc +84 (12 ký tự). Ví dụ: 0123456789 hoặc +84123456789" });
                }
                return StatusCode(500, new { success = false, message = $"Lỗi database: {sqlEx.Message}" });
            }
            catch (Exception ex)
            {
                // Kiểm tra lỗi CHECK constraint trong message (fallback)
                if (ex.Message.Contains("CK_SinhVien_PhoneFormat") || ex.Message.Contains("CHECK constraint"))
                {
                    return BadRequest(new { success = false, message = "Số điện thoại không đúng định dạng. Vui lòng nhập số bắt đầu bằng 0 (10 số) hoặc +84 (12 ký tự). Ví dụ: 0123456789 hoặc +84123456789" });
                }
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userId = User.FindFirst("MaTaiKhoan")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { success = false, message = "Không tìm thấy thông tin người dùng" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                // Lấy mật khẩu hiện tại từ database
                using var getPasswordCommand = new SqlCommand("SELECT MatKhau FROM TaiKhoan WHERE MaTaiKhoan = @MaTaiKhoan AND IsDeleted = 0", connection);
                getPasswordCommand.Parameters.AddWithValue("@MaTaiKhoan", Convert.ToInt32(userId));

                var oldHashedPassword = await getPasswordCommand.ExecuteScalarAsync() as string;
                
                if (oldHashedPassword == null)
                    return Unauthorized(new { success = false, message = "Không tìm thấy tài khoản" });

                // Validate mật khẩu cũ
                var isPasswordValid = false;
                try
                {
                    var isBcrypt = oldHashedPassword.StartsWith("$2");
                    if (isBcrypt)
                    {
                        isPasswordValid = BCrypt.Net.BCrypt.Verify(request.OldPassword, oldHashedPassword);
                    }
                    else
                    {
                        // Fallback: so sánh plaintext (cho legacy accounts)
                        isPasswordValid = oldHashedPassword == request.OldPassword;
                    }
                }
                catch
                {
                    isPasswordValid = false;
                }

                if (!isPasswordValid)
                    return BadRequest(new { success = false, message = "Mật khẩu cũ không đúng" });

                // Hash mật khẩu mới với BCrypt
                var newHashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

                // Cập nhật mật khẩu
                using var command = new SqlCommand("sp_TaiKhoan_ChangePassword", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@MaTaiKhoan", Convert.ToInt32(userId));
                command.Parameters.AddWithValue("@MatKhauMoi", newHashedPassword);
                command.Parameters.AddWithValue("@NguoiCapNhat", (object?)User.FindFirst("MaTaiKhoan")?.Value ?? DBNull.Value);

                var result = await command.ExecuteNonQueryAsync();
                
                if (result > 0)
                {
                    return Ok(new { success = true, message = "Đổi mật khẩu thành công" });
                }

                return BadRequest(new { success = false, message = "Không thể đổi mật khẩu" });
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

    public class UpdateProfileRequest
    {
        public string HoTen { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public string? SDT { get; set; }
        public string? Email { get; set; }
        public string? DiaChi { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
