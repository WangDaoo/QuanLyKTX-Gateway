using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Security.Claims;
using KTX_NguoiDung.Models;

namespace KTX_NguoiDung.Controllers
{
    [ApiController]
    [Route("api/rooms")]
    [Authorize(Roles = "Student")]
    public class RoomsController : ControllerBase
    {
        private readonly string _connectionString;

        public RoomsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("KTX") ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_Phong_GetAll", connection);
                command.CommandType = CommandType.StoredProcedure;

                using var reader = await command.ExecuteReaderAsync();
                var rooms = new List<object>();

                while (await reader.ReadAsync())
                {
                    rooms.Add(new
                    {
                        MaPhong = reader.GetInt32("MaPhong"),
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        SoPhong = reader.GetString("SoPhong"),
                        TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha"),
                        SoGiuong = reader.GetInt32("SoGiuong"),
                        LoaiPhong = reader.GetString("LoaiPhong"),
                        GiaPhong = reader.GetDecimal("GiaPhong"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        TrangThai = reader.GetString("TrangThai"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = rooms });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_Phong_GetById", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@MaPhong", id);

                using var reader = await command.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    var room = new
                    {
                        MaPhong = reader.GetInt32("MaPhong"),
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        SoPhong = reader.GetString("SoPhong"),
                        TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha"),
                        SoGiuong = reader.GetInt32("SoGiuong"),
                        LoaiPhong = reader.GetString("LoaiPhong"),
                        GiaPhong = reader.GetDecimal("GiaPhong"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        TrangThai = reader.GetString("TrangThai"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = room });
                }

                return NotFound(new { success = false, message = "Không tìm thấy phòng" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentRoom()
        {
            try
            {
                var (studentId, errorMessage) = GetCurrentStudentId();
                if (studentId == null)
                    return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin người dùng" });

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_Phong_GetCurrentBySinhVien", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@MaSinhVien", studentId);

                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    var room = new
                    {
                        MaPhong = reader.GetInt32("MaPhong"),
                        SoPhong = reader.GetString("SoPhong"),
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha"),
                        SoGiuong = reader.GetInt32("SoGiuong"),
                        LoaiPhong = reader.GetString("LoaiPhong"),
                        GiaPhong = reader.IsDBNull("GiaPhong") ? (decimal?)null : reader.GetDecimal("GiaPhong"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        TrangThai = reader.GetString("TrangThai")
                    };
                    return Ok(new { success = true, data = room });
                }

                return NotFound(new { success = false, message = "Không tìm thấy phòng hiện tại" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableRooms()
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_Phong_GetAvailable", connection);
                command.CommandType = CommandType.StoredProcedure;

                using var reader = await command.ExecuteReaderAsync();
                var rooms = new List<object>();
                
                while (await reader.ReadAsync())
                {
                    rooms.Add(new
                    {
                        MaPhong = reader.GetInt32("MaPhong"),
                        SoPhong = reader.GetString("SoPhong"),
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        TenToaNha = reader.GetString("TenToaNha"),
                        SoGiuong = reader.GetInt32("SoGiuong"),
                        LoaiPhong = reader.GetString("LoaiPhong"),
                        GiaPhong = reader.GetDecimal("GiaPhong"),
                        TrangThai = reader.GetString("TrangThai")
                    });
                }

                return Ok(new { success = true, data = rooms });
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
