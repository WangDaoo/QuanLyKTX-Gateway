using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using BCrypt.Net;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("KTX") ?? throw new ArgumentNullException(nameof(configuration));
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("SELECT * FROM TaiKhoan WHERE TenDangNhap = @TenDangNhap AND IsDeleted = 0", connection);
                command.Parameters.AddWithValue("@TenDangNhap", request.TenDangNhap);

                using var reader = await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                    return Unauthorized(new { success = false, message = "Tên đăng nhập hoặc mật khẩu không đúng" });

                var maTaiKhoan = reader.GetInt32("MaTaiKhoan");
                var tenDangNhap = reader.GetString("TenDangNhap");
                var hoTen = reader.GetString("HoTen");
                var email = reader.IsDBNull("Email") ? null : reader.GetString("Email");
                var vaiTro = reader.GetString("VaiTro");
                var trangThai = reader.GetBoolean("TrangThai");
                var maSinhVienDb = reader.IsDBNull("MaSinhVien") ? (int?)null : reader.GetInt32("MaSinhVien");
                var dbPassword = reader.GetString("MatKhau");

                var isBcrypt = dbPassword.StartsWith("$2");
                var isPasswordValid = false;
                try
                {
                    if (isBcrypt)
                    {
                        isPasswordValid = BCrypt.Net.BCrypt.Verify(request.MatKhau, dbPassword);
                    }
                }
                catch
                {
                    isPasswordValid = false;
                }

                if (!isPasswordValid && !isBcrypt)
                {
                    // Fallback legacy: so sánh plaintext, nếu đúng thì migrate sang BCrypt
                    if (dbPassword == request.MatKhau)
                    {
                        isPasswordValid = true;
                        var newHash = BCrypt.Net.BCrypt.HashPassword(request.MatKhau);

                        await reader.DisposeAsync();

                        using var updateCmd = new SqlCommand("UPDATE TaiKhoan SET MatKhau = @MatKhau WHERE MaTaiKhoan = @MaTaiKhoan", connection);
                        updateCmd.Parameters.AddWithValue("@MatKhau", newHash);
                        updateCmd.Parameters.AddWithValue("@MaTaiKhoan", maTaiKhoan);
                        await updateCmd.ExecuteNonQueryAsync();
                    }
                }

                if (!isPasswordValid)
                    return Unauthorized(new { success = false, message = "Tên đăng nhập hoặc mật khẩu không đúng" });

                var user = new
                {
                    MaTaiKhoan = maTaiKhoan,
                    TenDangNhap = tenDangNhap,
                    HoTen = hoTen,
                    Email = email,
                    VaiTro = vaiTro,
                    TrangThai = trangThai,
                    MaSinhVien = maSinhVienDb
                };

                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    success = true,
                    message = "Đăng nhập thành công",
                    user = user,
                    token = token,
                    expiresIn = DateTime.UtcNow.AddHours(24)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Hash mật khẩu với BCrypt
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.MatKhau);

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_TaiKhoan_Insert", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@TenDangNhap", request.TenDangNhap);
                command.Parameters.AddWithValue("@MatKhau", hashedPassword); // Sử dụng mật khẩu đã hash
                command.Parameters.AddWithValue("@HoTen", request.HoTen);
                command.Parameters.AddWithValue("@Email", request.Email ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@VaiTro", request.VaiTro);
                command.Parameters.AddWithValue("@MaSinhVien", request.MaSinhVien ?? (object)DBNull.Value);

                var newId = await command.ExecuteScalarAsync();

                return Ok(new { success = true, message = "Đăng ký thành công", MaTaiKhoan = newId });
            }
            catch (SqlException sqlEx)
            {
                // Kiểm tra lỗi duplicate key constraint
                if (sqlEx.Number == 2627 || sqlEx.Message.Contains("UNIQUE KEY constraint") || sqlEx.Message.Contains("duplicate key"))
                {
                    // Trích xuất tên đăng nhập từ thông báo lỗi
                    var duplicateValue = request.TenDangNhap;
                    if (sqlEx.Message.Contains("duplicate key value is"))
                    {
                        var match = Regex.Match(sqlEx.Message, @"duplicate key value is \(([^)]+)\)");
                        if (match.Success)
                        {
                            duplicateValue = match.Groups[1].Value;
                        }
                    }
                    
                    return BadRequest(new { 
                        success = false, 
                        message = $"Tên đăng nhập '{duplicateValue}' đã tồn tại. Vui lòng chọn tên đăng nhập khác." 
                    });
                }
                
                return StatusCode(500, new { success = false, message = $"Lỗi server: {sqlEx.Message}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_TaiKhoan_GetAll", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                using var reader = await command.ExecuteReaderAsync();
                var users = new List<object>();

                while (await reader.ReadAsync())
                {
                    users.Add(new
                    {
                        MaTaiKhoan = reader.GetInt32("MaTaiKhoan"),
                        TenDangNhap = reader.GetString("TenDangNhap"),
                        HoTen = reader.GetString("HoTen"),
                        Email = reader.IsDBNull("Email") ? null : reader.GetString("Email"),
                        VaiTro = reader.GetString("VaiTro"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        TenSinhVien = reader.IsDBNull("TenSinhVien") ? null : reader.GetString("TenSinhVien"),
                        MSSV = reader.IsDBNull("MSSV") ? null : reader.GetString("MSSV")
                    });
                }

                return Ok(new { success = true, data = users });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                    return Unauthorized(new { success = false, message = "Không xác thực được người dùng" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                // Kiểm tra mật khẩu cũ
                using var checkCommand = new SqlCommand("SELECT MatKhau FROM TaiKhoan WHERE MaTaiKhoan = @MaTaiKhoan", connection);
                checkCommand.Parameters.AddWithValue("@MaTaiKhoan", userId);

                var oldHashedPassword = await checkCommand.ExecuteScalarAsync() as string;
                if (oldHashedPassword == null || !BCrypt.Net.BCrypt.Verify(request.OldPassword, oldHashedPassword))
                {
                    return BadRequest(new { success = false, message = "Mật khẩu cũ không đúng" });
                }

                // Cập nhật mật khẩu mới
                var newHashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                using var updateCommand = new SqlCommand("UPDATE TaiKhoan SET MatKhau = @MatKhau WHERE MaTaiKhoan = @MaTaiKhoan", connection);
                updateCommand.Parameters.AddWithValue("@MatKhau", newHashedPassword);
                updateCommand.Parameters.AddWithValue("@MaTaiKhoan", userId);

                await updateCommand.ExecuteNonQueryAsync();

                return Ok(new { success = true, message = "Đổi mật khẩu thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_TaiKhoan_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaTaiKhoan", id);

                using var reader = await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                    return NotFound(new { success = false, message = "Không tìm thấy tài khoản" });

                var user = new
                {
                    MaTaiKhoan = reader.GetInt32("MaTaiKhoan"),
                    TenDangNhap = reader.GetString("TenDangNhap"),
                    HoTen = reader.GetString("HoTen"),
                    Email = reader.IsDBNull("Email") ? null : reader.GetString("Email"),
                    VaiTro = reader.GetString("VaiTro"),
                    TrangThai = reader.GetBoolean("TrangThai"),
                    MaSinhVien = reader.IsDBNull("MaSinhVien") ? (int?)null : reader.GetInt32("MaSinhVien"),
                    NgayTao = reader.GetDateTime("NgayTao"),
                    NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat")
                };

                return Ok(new { success = true, data = user });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                // Lấy TenDangNhap hiện tại từ database
                string currentTenDangNhap = null;
                using (var getCommand = new SqlCommand("sp_TaiKhoan_GetById", connection))
                {
                    getCommand.CommandType = CommandType.StoredProcedure;
                    getCommand.Parameters.AddWithValue("@MaTaiKhoan", id);
                    
                    using var reader = await getCommand.ExecuteReaderAsync();
                    if (!await reader.ReadAsync())
                    {
                        return NotFound(new { success = false, message = "Không tìm thấy tài khoản" });
                    }
                    currentTenDangNhap = reader.GetString("TenDangNhap");
                }

                // Cập nhật thông tin tài khoản
                using var command = new SqlCommand("sp_TaiKhoan_Update", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@MaTaiKhoan", id);
                command.Parameters.AddWithValue("@TenDangNhap", currentTenDangNhap); // Giữ nguyên tên đăng nhập hiện tại
                command.Parameters.AddWithValue("@HoTen", request.HoTen);
                command.Parameters.AddWithValue("@Email", request.Email ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@VaiTro", request.VaiTro);
                command.Parameters.AddWithValue("@TrangThai", request.TrangThai);
                command.Parameters.AddWithValue("@MaSinhVien", request.MaSinhVien ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@NguoiCapNhat", GetCurrentUserId()?.ToString() ?? "Admin");

                await command.ExecuteNonQueryAsync();

                return Ok(new { success = true, message = "Cập nhật tài khoản thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpDelete("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                // Không cho phép xóa tài khoản admin và officer mặc định
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var checkCommand = new SqlCommand("SELECT TenDangNhap, VaiTro FROM TaiKhoan WHERE MaTaiKhoan = @MaTaiKhoan AND IsDeleted = 0", connection);
                checkCommand.Parameters.AddWithValue("@MaTaiKhoan", id);

                using var reader = await checkCommand.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                    return NotFound(new { success = false, message = "Không tìm thấy tài khoản" });

                var tenDangNhap = reader.GetString("TenDangNhap");
                var vaiTro = reader.GetString("VaiTro");

                await reader.DisposeAsync();

                // Không cho phép xóa admin/officer mặc định
                if (tenDangNhap == "admin" || tenDangNhap == "officer")
                {
                    return BadRequest(new { success = false, message = "Không thể xóa tài khoản hệ thống" });
                }

                // Soft delete
                using var deleteCommand = new SqlCommand("UPDATE TaiKhoan SET IsDeleted = 1, NgayCapNhat = GETDATE(), NguoiCapNhat = @NguoiCapNhat WHERE MaTaiKhoan = @MaTaiKhoan", connection);
                deleteCommand.Parameters.AddWithValue("@MaTaiKhoan", id);
                deleteCommand.Parameters.AddWithValue("@NguoiCapNhat", GetCurrentUserId()?.ToString() ?? "Admin");

                await deleteCommand.ExecuteNonQueryAsync();

                return Ok(new { success = true, message = "Xóa tài khoản thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("users/{id}/reset-password")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest request)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                // Kiểm tra tài khoản tồn tại
                using var checkCommand = new SqlCommand("SELECT MaTaiKhoan FROM TaiKhoan WHERE MaTaiKhoan = @MaTaiKhoan AND IsDeleted = 0", connection);
                checkCommand.Parameters.AddWithValue("@MaTaiKhoan", id);

                var exists = await checkCommand.ExecuteScalarAsync();
                if (exists == null)
                    return NotFound(new { success = false, message = "Không tìm thấy tài khoản" });

                // Reset mật khẩu
                var newHashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                using var updateCommand = new SqlCommand("UPDATE TaiKhoan SET MatKhau = @MatKhau, NgayCapNhat = GETDATE(), NguoiCapNhat = @NguoiCapNhat WHERE MaTaiKhoan = @MaTaiKhoan", connection);
                updateCommand.Parameters.AddWithValue("@MatKhau", newHashedPassword);
                updateCommand.Parameters.AddWithValue("@MaTaiKhoan", id);
                updateCommand.Parameters.AddWithValue("@NguoiCapNhat", GetCurrentUserId()?.ToString() ?? "Admin");

                await updateCommand.ExecuteNonQueryAsync();

                return Ok(new { success = true, message = "Reset mật khẩu thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("users/{id}/lock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> LockOrUnlockUser(int id, [FromBody] LockUserRequest request)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                // Không cho phép khóa tài khoản admin/officer mặc định
                using var checkCommand = new SqlCommand("SELECT TenDangNhap FROM TaiKhoan WHERE MaTaiKhoan = @MaTaiKhoan AND IsDeleted = 0", connection);
                checkCommand.Parameters.AddWithValue("@MaTaiKhoan", id);

                using var reader = await checkCommand.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                    return NotFound(new { success = false, message = "Không tìm thấy tài khoản" });

                var tenDangNhap = reader.GetString("TenDangNhap");
                await reader.DisposeAsync();

                // Không cho phép khóa admin/officer mặc định
                if ((tenDangNhap == "admin" || tenDangNhap == "officer") && request.IsLocked)
                {
                    return BadRequest(new { success = false, message = "Không thể khóa tài khoản hệ thống" });
                }

                // Cập nhật trạng thái
                using var updateCommand = new SqlCommand("UPDATE TaiKhoan SET TrangThai = @TrangThai, NgayCapNhat = GETDATE(), NguoiCapNhat = @NguoiCapNhat WHERE MaTaiKhoan = @MaTaiKhoan", connection);
                updateCommand.Parameters.AddWithValue("@TrangThai", !request.IsLocked); // TrangThai = 1 là hoạt động, 0 là bị khóa
                updateCommand.Parameters.AddWithValue("@MaTaiKhoan", id);
                updateCommand.Parameters.AddWithValue("@NguoiCapNhat", GetCurrentUserId()?.ToString() ?? "Admin");

                await updateCommand.ExecuteNonQueryAsync();

                var message = request.IsLocked ? "Khóa tài khoản thành công" : "Mở khóa tài khoản thành công";
                return Ok(new { success = true, message = message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        private string GenerateJwtToken(dynamic user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? "KTX_SecretKey_2024_VeryLongAndSecureKey_ForJWT_Token_Generation";
            var issuer = jwtSettings["Issuer"] ?? "KTX-Admin";
            var audience = jwtSettings["Audience"] ?? "KTX-Users";
            var expiryHours = int.Parse(jwtSettings["ExpiryInHours"] ?? "24");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.MaTaiKhoan.ToString()),
                new Claim("MaTaiKhoan", user.MaTaiKhoan.ToString()), // Thêm claim này để User API có thể đọc được
                new Claim(ClaimTypes.Name, user.TenDangNhap),
                new Claim(ClaimTypes.GivenName, user.HoTen),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Role, user.VaiTro),
                new Claim("MaSinhVien", user.MaSinhVien?.ToString() ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiryHours),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : null;
        }
    }

    // Request Models
    public class LoginRequest
    {
        public string TenDangNhap { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string TenDangNhap { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string VaiTro { get; set; } = "Student";
        public int? MaSinhVien { get; set; }
    }
    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class UpdateUserRequest
    {
        public string HoTen { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string VaiTro { get; set; } = "Student";
        public bool TrangThai { get; set; } = true;
        public int? MaSinhVien { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
    }

    public class LockUserRequest
    {
        public bool IsLocked { get; set; }
    }
}
