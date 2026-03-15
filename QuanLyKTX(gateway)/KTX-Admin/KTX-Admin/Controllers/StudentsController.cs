using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/students")]
    [Authorize(Roles = "Admin,Officer")]
    public class StudentsController : ControllerBase
    {
        private readonly string _connectionString;

        public StudentsController(IConfiguration configuration)
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

                using var command = new SqlCommand("sp_SinhVien_GetAll", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                using var reader = await command.ExecuteReaderAsync();
                var students = new List<SinhVien>();

                while (await reader.ReadAsync())
                {
                    students.Add(new SinhVien
                    {
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        HoTen = reader.GetString("HoTen"),
                        MSSV = reader.GetString("MSSV"),
                        Lop = reader.GetString("Lop"),
                        Khoa = reader.GetString("Khoa"),
                        NgaySinh = reader.IsDBNull("NgaySinh") ? (DateTime?)null : reader.GetDateTime("NgaySinh"),
                        GioiTinh = reader.IsDBNull("GioiTinh") ? null : reader.GetString("GioiTinh"),
                        SDT = reader.IsDBNull("SDT") ? null : reader.GetString("SDT"),
                        Email = reader.IsDBNull("Email") ? null : reader.GetString("Email"),
                        DiaChi = reader.IsDBNull("DiaChi") ? null : reader.GetString("DiaChi"),
                        AnhDaiDien = reader.IsDBNull("AnhDaiDien") ? null : reader.GetString("AnhDaiDien"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        MaPhong = reader.IsDBNull("MaPhong") ? null : reader.GetInt32("MaPhong"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat"),
                        SoPhong = reader.IsDBNull("SoPhong") ? null : reader.GetString("SoPhong"),
                        TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha")
                    });
                }

                return Ok(new { success = true, data = students });
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

                using var command = new SqlCommand("sp_SinhVien_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaSinhVien", id);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var student = new SinhVien
                    {
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        HoTen = reader.GetString("HoTen"),
                        MSSV = reader.GetString("MSSV"),
                        Lop = reader.GetString("Lop"),
                        Khoa = reader.GetString("Khoa"),
                        NgaySinh = reader.IsDBNull("NgaySinh") ? (DateTime?)null : reader.GetDateTime("NgaySinh"),
                        GioiTinh = reader.IsDBNull("GioiTinh") ? null : reader.GetString("GioiTinh"),
                        SDT = reader.IsDBNull("SDT") ? null : reader.GetString("SDT"),
                        Email = reader.IsDBNull("Email") ? null : reader.GetString("Email"),
                        DiaChi = reader.IsDBNull("DiaChi") ? null : reader.GetString("DiaChi"),
                        AnhDaiDien = reader.IsDBNull("AnhDaiDien") ? null : reader.GetString("AnhDaiDien"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        MaPhong = reader.IsDBNull("MaPhong") ? null : reader.GetInt32("MaPhong"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat"),
                        SoPhong = reader.IsDBNull("SoPhong") ? null : reader.GetString("SoPhong"),
                        TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha")
                    };
                    return Ok(new { success = true, data = student });
                }
                return NotFound(new { success = false, message = "Không tìm thấy sinh viên" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSinhVienRequest request)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_SinhVien_Create", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@HoTen", request.HoTen);
                command.Parameters.AddWithValue("@MSSV", request.MSSV);
                command.Parameters.AddWithValue("@Lop", request.Lop);
                command.Parameters.AddWithValue("@Khoa", request.Khoa);
                command.Parameters.AddWithValue("@NgaySinh", request.NgaySinh ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@GioiTinh", request.GioiTinh ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@SDT", request.SDT ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@Email", request.Email ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@DiaChi", request.DiaChi ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@AnhDaiDien", (object?)request.AnhDaiDien ?? DBNull.Value);
                command.Parameters.AddWithValue("@TrangThai", true);
                command.Parameters.AddWithValue("@MaPhong", request.MaPhong ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@NguoiTao", (object?)null ?? DBNull.Value);

                var newId = await command.ExecuteScalarAsync();
                return CreatedAtAction(nameof(GetById), new { id = newId }, new { success = true, data = new { MaSinhVien = newId }, message = $"Tạo sinh viên thành công. Tài khoản đã được tạo tự động với tên đăng nhập và mật khẩu là MSSV: {request.MSSV}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSinhVienRequest request)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_SinhVien_Update", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@MaSinhVien", id);
                command.Parameters.AddWithValue("@HoTen", request.HoTen);
                command.Parameters.AddWithValue("@MSSV", request.MSSV);
                command.Parameters.AddWithValue("@Lop", request.Lop);
                command.Parameters.AddWithValue("@Khoa", request.Khoa);
                command.Parameters.AddWithValue("@NgaySinh", request.NgaySinh ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@GioiTinh", request.GioiTinh ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@SDT", request.SDT ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@Email", request.Email ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@DiaChi", request.DiaChi ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@MaPhong", request.MaPhong ?? (object)DBNull.Value);

                var affectedRows = await command.ExecuteScalarAsync();
                if (Convert.ToInt32(affectedRows) > 0)
                {
                    // Fetch lại student sau khi update để trả về data
                    using var getCommand = new SqlCommand("sp_SinhVien_GetById", connection)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    getCommand.Parameters.AddWithValue("@MaSinhVien", id);

                    using var reader = await getCommand.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        var updatedStudent = new SinhVien
                        {
                            MaSinhVien = reader.GetInt32("MaSinhVien"),
                            HoTen = reader.GetString("HoTen"),
                            MSSV = reader.GetString("MSSV"),
                            Lop = reader.GetString("Lop"),
                            Khoa = reader.GetString("Khoa"),
                            NgaySinh = reader.IsDBNull("NgaySinh") ? (DateTime?)null : reader.GetDateTime("NgaySinh"),
                            GioiTinh = reader.IsDBNull("GioiTinh") ? null : reader.GetString("GioiTinh"),
                            SDT = reader.IsDBNull("SDT") ? null : reader.GetString("SDT"),
                            Email = reader.IsDBNull("Email") ? null : reader.GetString("Email"),
                            DiaChi = reader.IsDBNull("DiaChi") ? null : reader.GetString("DiaChi"),
                            AnhDaiDien = reader.IsDBNull("AnhDaiDien") ? null : reader.GetString("AnhDaiDien"),
                            TrangThai = reader.GetBoolean("TrangThai"),
                            MaPhong = reader.IsDBNull("MaPhong") ? null : reader.GetInt32("MaPhong"),
                            IsDeleted = reader.GetBoolean("IsDeleted"),
                            NgayTao = reader.GetDateTime("NgayTao"),
                            NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                            NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                            NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat"),
                            SoPhong = reader.IsDBNull("SoPhong") ? null : reader.GetString("SoPhong"),
                            TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha")
                        };
                        return Ok(new { success = true, data = updatedStudent, message = "Cập nhật sinh viên thành công" });
                    }
                }
                return NotFound(new { success = false, message = "Không tìm thấy sinh viên" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_SinhVien_Delete", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@MaSinhVien", id);

                var affectedRows = await command.ExecuteScalarAsync();
                if (Convert.ToInt32(affectedRows) > 0) return Ok(new { success = true, message = "Xóa sinh viên thành công" });
                return NotFound(new { success = false, message = "Không tìm thấy sinh viên" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("by-room/{maPhong:int}")]
        public async Task<IActionResult> GetByRoom(int maPhong)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_SinhVien_GetByPhong", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaPhong", maPhong);

                using var reader = await command.ExecuteReaderAsync();
                var students = new List<SinhVien>();
                while (await reader.ReadAsync())
                {
                    students.Add(new SinhVien
                    {
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        HoTen = reader.GetString("HoTen"),
                        MSSV = reader.GetString("MSSV"),
                        Lop = reader.GetString("Lop"),
                        Khoa = reader.GetString("Khoa"),
                        NgaySinh = reader.IsDBNull("NgaySinh") ? (DateTime?)null : reader.GetDateTime("NgaySinh"),
                        GioiTinh = reader.IsDBNull("GioiTinh") ? null : reader.GetString("GioiTinh"),
                        SDT = reader.IsDBNull("SDT") ? null : reader.GetString("SDT"),
                        Email = reader.IsDBNull("Email") ? null : reader.GetString("Email"),
                        DiaChi = reader.IsDBNull("DiaChi") ? null : reader.GetString("DiaChi"),
                        AnhDaiDien = reader.IsDBNull("AnhDaiDien") ? null : reader.GetString("AnhDaiDien"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        MaPhong = reader.IsDBNull("MaPhong") ? null : reader.GetInt32("MaPhong"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat"),
                        SoPhong = reader.IsDBNull("SoPhong") ? null : reader.GetString("SoPhong"),
                        TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha")
                    });
                }
                return Ok(new { success = true, data = students });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }

    // Request Models
    public class CreateSinhVienRequest
    {
        public string HoTen { get; set; } = string.Empty;
        public string MSSV { get; set; } = string.Empty;
        public string Lop { get; set; } = string.Empty;
        public string Khoa { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public string? SDT { get; set; }
        public string? Email { get; set; }
        public string? DiaChi { get; set; }
        public string? AnhDaiDien { get; set; }
        public int? MaPhong { get; set; }
    }

    public class UpdateSinhVienRequest
    {
        public string HoTen { get; set; } = string.Empty;
        public string MSSV { get; set; } = string.Empty;
        public string Lop { get; set; } = string.Empty;
        public string Khoa { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public string? SDT { get; set; }
        public string? Email { get; set; }
        public string? DiaChi { get; set; }
        public int? MaPhong { get; set; }
    }
}





