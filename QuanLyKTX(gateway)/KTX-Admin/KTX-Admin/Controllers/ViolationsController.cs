using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using KTX_Admin.Models.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Linq;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/violations")]
    [Authorize(Roles = "Admin,Officer")]
    public class ViolationsController : ControllerBase
    {
        private readonly string _connectionString;

        public ViolationsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("KTX") ?? throw new ArgumentNullException(nameof(configuration));
        }

        private static KyLuatResponse MapViolation(SqlDataReader reader)
        {
            return new KyLuatResponse
            {
                MaKyLuat = reader.GetInt32("MaKyLuat"),
                MaSinhVien = reader.GetInt32("MaSinhVien"),
                LoaiViPham = reader.GetString("LoaiViPham"),
                MoTa = reader.GetString("MoTa"),
                NgayViPham = reader.GetDateTime("NgayViPham"),
                MucPhat = reader.GetDecimal("MucPhat"),
                TrangThai = reader.GetString("TrangThai"),
                GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                IsDeleted = reader.GetBoolean("IsDeleted"),
                NgayTao = reader.GetDateTime("NgayTao"),
                NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat"),
                TenSinhVien = reader.IsDBNull("TenSinhVien") ? null : reader.GetString("TenSinhVien"),
                MSSV = reader.IsDBNull("MSSV") ? null : reader.GetString("MSSV"),
                Lop = reader.IsDBNull("Lop") ? null : reader.GetString("Lop"),
                Khoa = reader.IsDBNull("Khoa") ? null : reader.GetString("Khoa"),
                SoPhong = reader.IsDBNull("SoPhong") ? null : reader.GetString("SoPhong"),
                TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha")
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? maSinhVien = null, [FromQuery] string? loaiViPham = null)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_KyLuat_GetAll", connection) { CommandType = CommandType.StoredProcedure };
                using var reader = await command.ExecuteReaderAsync();
                var allItems = new List<KyLuatResponse>();
                while (await reader.ReadAsync())
                {
                    allItems.Add(MapViolation(reader));
                }

                // Lọc kết quả theo query parameters
                var items = allItems;
                if (maSinhVien.HasValue)
                    items = items.Where(i => i.MaSinhVien == maSinhVien.Value).ToList();
                if (!string.IsNullOrEmpty(loaiViPham))
                    items = items.Where(i => i.LoaiViPham.Contains(loaiViPham, StringComparison.OrdinalIgnoreCase)).ToList();
                
                return Ok(new { success = true, data = items });
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
                using var command = new SqlCommand("sp_KyLuat_GetById", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaKyLuat", id);
                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var item = MapViolation(reader);
                    return Ok(new { success = true, data = item });
                }
                return NotFound(new { success = false, message = "Không tìm thấy kỷ luật" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] KyLuat model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_KyLuat_Insert", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
                command.Parameters.AddWithValue("@LoaiViPham", model.LoaiViPham);
                command.Parameters.AddWithValue("@MoTa", model.MoTa);
                command.Parameters.AddWithValue("@NgayViPham", model.NgayViPham);
                command.Parameters.AddWithValue("@MucPhat", model.MucPhat);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                var newId = await command.ExecuteScalarAsync();
                var createdId = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;

                if (createdId > 0)
                {
                    using var getCommand = new SqlCommand("sp_KyLuat_GetById", connection) { CommandType = CommandType.StoredProcedure };
                    getCommand.Parameters.AddWithValue("@MaKyLuat", createdId);
                    using var reader = await getCommand.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        var created = MapViolation(reader);
                        return CreatedAtAction(nameof(GetById), new { id = createdId }, new { success = true, data = created });
                    }
                }

                return CreatedAtAction(nameof(GetById), new { id = createdId }, new { success = true, data = model });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] KyLuat model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_KyLuat_Update", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaKyLuat", id);
                command.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
                command.Parameters.AddWithValue("@LoaiViPham", model.LoaiViPham);
                command.Parameters.AddWithValue("@MoTa", model.MoTa);
                command.Parameters.AddWithValue("@NgayViPham", model.NgayViPham);
                command.Parameters.AddWithValue("@MucPhat", model.MucPhat);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                var rows = await command.ExecuteNonQueryAsync();
                if (rows == 0) return NotFound(new { success = false, message = "Không tìm thấy kỷ luật" });

                // Fetch lại violation sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_KyLuat_GetById", connection) { CommandType = CommandType.StoredProcedure };
                getCommand.Parameters.AddWithValue("@MaKyLuat", id);
                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedViolation = MapViolation(reader);
                    return Ok(new { success = true, data = updatedViolation, message = "Cập nhật kỷ luật thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật kỷ luật thành công" });
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
                using var command = new SqlCommand("sp_KyLuat_Delete", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaKyLuat", id);
                var rows = await command.ExecuteNonQueryAsync();
                if (rows == 0) return NotFound(new { success = false, message = "Không tìm thấy kỷ luật" });
                return Ok(new { success = true, message = "Xóa kỷ luật thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}


