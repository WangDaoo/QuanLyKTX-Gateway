using Microsoft.AspNetCore.Mvc;
using KTX_NguoiDung.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_NguoiDung.Controllers
{
    [ApiController]
    [Route("api/receipts")] 
    [Authorize(Roles = "Student")]
    public class ReceiptsController : ControllerBase
    {
        private readonly string _connectionString;

        public ReceiptsController(IConfiguration configuration)
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

                using var command = new SqlCommand("sp_BienLaiThu_GetBySinhVien", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaSinhVien", maSinhVien);

                using var reader = await command.ExecuteReaderAsync();
                var receipts = new List<BienLaiThu>();

                while (await reader.ReadAsync())
                {
                    receipts.Add(new BienLaiThu
                    {
                        MaBienLai = reader.GetInt32("MaBienLai"),
                        MaHoaDon = reader.GetInt32("MaHoaDon"),
                        SoTienThu = reader.GetDecimal("SoTienThu"),
                        NgayThu = reader.GetDateTime("NgayThu"),
                        PhuongThucThanhToan = reader.GetString("PhuongThucThanhToan"),
                        NguoiThu = reader.IsDBNull("NguoiThu") ? null : reader.GetString("NguoiThu"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = receipts });
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


