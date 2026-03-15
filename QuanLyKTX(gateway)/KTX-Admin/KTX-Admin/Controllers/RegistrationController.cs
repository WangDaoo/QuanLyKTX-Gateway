using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using KTX_Admin.Models.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/registrations")]
    [Authorize(Roles = "Admin,Officer")]
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
                MaPhongDeXuat = reader.IsDBNull("MaPhongDeXuat") ? null : reader.GetInt32("MaPhongDeXuat"),
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
                Lop = reader.IsDBNull("Lop") ? null : reader.GetString("Lop"),
                Khoa = reader.IsDBNull("Khoa") ? null : reader.GetString("Khoa"),
                PhongDeXuat = reader.IsDBNull("PhongDeXuat") ? null : reader.GetString("PhongDeXuat"),
                ToaNhaDeXuat = reader.IsDBNull("ToaNhaDeXuat") ? null : reader.GetString("ToaNhaDeXuat")
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_DonDangKy_GetAll", connection) { CommandType = CommandType.StoredProcedure };
                using var reader = await command.ExecuteReaderAsync();
                var items = new List<DonDangKyResponse>();
                while (await reader.ReadAsync())
                {
                    items.Add(MapRegistration(reader));
                }
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
                using var command = new SqlCommand("sp_DonDangKy_GetById", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaDon", id);
                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var item = MapRegistration(reader);
                    return Ok(new { success = true, data = item });
                }
                return NotFound(new { success = false, message = "Không tìm thấy đơn đăng ký" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DonDangKy model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_DonDangKy_Create", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
                command.Parameters.AddWithValue("@MaPhongDeXuat", (object?)model.MaPhongDeXuat ?? DBNull.Value);
                command.Parameters.AddWithValue("@LyDo", (object?)model.LyDo ?? DBNull.Value);
                command.Parameters.AddWithValue("@NgayDangKy", model.NgayDangKy);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiTao", (object?)model.NguoiTao ?? DBNull.Value);
                var newId = await command.ExecuteScalarAsync();
                model.MaDon = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;

                if (model.MaDon > 0)
                {
                    using var getCommand = new SqlCommand("sp_DonDangKy_GetById", connection) { CommandType = CommandType.StoredProcedure };
                    getCommand.Parameters.AddWithValue("@MaDon", model.MaDon);
                    using var reader = await getCommand.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        var created = MapRegistration(reader);
                        return CreatedAtAction(nameof(GetById), new { id = model.MaDon }, new { success = true, data = created });
                    }
                }

                return CreatedAtAction(nameof(GetById), new { id = model.MaDon }, new { success = true, data = model });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] DonDangKy model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_DonDangKy_Update", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaDon", id);
                command.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
                command.Parameters.AddWithValue("@MaPhongDeXuat", (object?)model.MaPhongDeXuat ?? DBNull.Value);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@LyDo", (object?)model.LyDo ?? DBNull.Value);
                command.Parameters.AddWithValue("@NgayDangKy", model.NgayDangKy);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiCapNhat", (object?)model.NguoiCapNhat ?? DBNull.Value);
                var rows = await command.ExecuteNonQueryAsync();
                if (rows == 0) return NotFound(new { success = false, message = "Không tìm thấy đơn đăng ký" });

                // Fetch lại registration sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_DonDangKy_GetById", connection) { CommandType = CommandType.StoredProcedure };
                getCommand.Parameters.AddWithValue("@MaDon", id);
                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedRegistration = MapRegistration(reader);
                    return Ok(new { success = true, data = updatedRegistration, message = "Cập nhật đơn đăng ký thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật đơn đăng ký thành công" });
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
                using var command = new SqlCommand("sp_DonDangKy_Delete", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaDon", id);
                var rows = await command.ExecuteNonQueryAsync();
                if (rows == 0) return NotFound(new { success = false, message = "Không tìm thấy đơn đăng ký" });
                return Ok(new { success = true, message = "Xóa đơn đăng ký thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}


