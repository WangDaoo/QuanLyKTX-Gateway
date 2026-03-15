using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/overdue-notices")]
    [Authorize(Roles = "Admin,Officer")]
    public class OverdueController : ControllerBase
    {
        private readonly string _connectionString;

        public OverdueController(IConfiguration configuration)
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

                using var command = new SqlCommand("sp_ThongBaoQuaHan_GetAll", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                using var reader = await command.ExecuteReaderAsync();
                var notices = new List<ThongBaoQuaHan>();

                while (await reader.ReadAsync())
                {
                    notices.Add(new ThongBaoQuaHan
                    {
                        MaThongBao = reader.GetInt32("MaThongBao"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        MaHoaDon = reader.IsDBNull("MaHoaDon") ? (int?)null : reader.GetInt32("MaHoaDon"),
                        NgayThongBao = reader.GetDateTime("NgayThongBao"),
                        NoiDung = reader.GetString("NoiDung"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = notices });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ThongBaoQuaHan model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_ThongBaoQuaHan_Insert", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
                command.Parameters.AddWithValue("@MaHoaDon", model.MaHoaDon.HasValue && model.MaHoaDon.Value > 0 ? (object)model.MaHoaDon.Value : DBNull.Value);
                command.Parameters.AddWithValue("@NgayThongBao", model.NgayThongBao);
                command.Parameters.AddWithValue("@NoiDung", model.NoiDung);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);

                var newId = await command.ExecuteScalarAsync();
                model.MaThongBao = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;

                return CreatedAtAction(nameof(GetById), new { id = model.MaThongBao }, new { success = true, data = model });
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

                using var command = new SqlCommand("sp_ThongBaoQuaHan_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaThongBao", id);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var notice = new ThongBaoQuaHan
                    {
                        MaThongBao = reader.GetInt32("MaThongBao"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        MaHoaDon = reader.IsDBNull("MaHoaDon") ? (int?)null : reader.GetInt32("MaHoaDon"),
                        NgayThongBao = reader.GetDateTime("NgayThongBao"),
                        NoiDung = reader.GetString("NoiDung"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = notice });
                }

                return NotFound(new { success = false, message = "Không tìm thấy thông báo" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ThongBaoQuaHan model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_ThongBaoQuaHan_Update", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaThongBao", id);
                command.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
                command.Parameters.AddWithValue("@MaHoaDon", model.MaHoaDon.HasValue && model.MaHoaDon.Value > 0 ? (object)model.MaHoaDon.Value : DBNull.Value);
                command.Parameters.AddWithValue("@NgayThongBao", model.NgayThongBao);
                command.Parameters.AddWithValue("@NoiDung", model.NoiDung);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy thông báo" });

                // Fetch lại notice sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_ThongBaoQuaHan_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                getCommand.Parameters.AddWithValue("@MaThongBao", id);

                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedNotice = new ThongBaoQuaHan
                    {
                        MaThongBao = reader.GetInt32("MaThongBao"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        MaHoaDon = reader.IsDBNull("MaHoaDon") ? (int?)null : reader.GetInt32("MaHoaDon"),
                        NgayThongBao = reader.GetDateTime("NgayThongBao"),
                        NoiDung = reader.GetString("NoiDung"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = updatedNotice, message = "Cập nhật thông báo thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật thông báo thành công" });
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

                using var command = new SqlCommand("sp_ThongBaoQuaHan_Delete", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaThongBao", id);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy thông báo" });

                return Ok(new { success = true, message = "Xóa thông báo thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}

