using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/buildings")]
    [Authorize(Roles = "Admin,Officer")]
    public class BuildingsController : ControllerBase
    {
        private readonly string _connectionString;

        public BuildingsController(IConfiguration configuration)
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

                using var command = new SqlCommand("sp_ToaNha_GetAll", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                using var reader = await command.ExecuteReaderAsync();
                var buildings = new List<ToaNha>();

                while (await reader.ReadAsync())
                {
                    buildings.Add(new ToaNha
                    {
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        TenToaNha = reader.GetString("TenToaNha"),
                        DiaChi = reader.IsDBNull("DiaChi") ? null : reader.GetString("DiaChi"),
                        SoTang = reader.IsDBNull("SoTang") ? null : reader.GetInt32("SoTang"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = buildings });
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

                using var command = new SqlCommand("sp_ToaNha_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaToaNha", id);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var building = new ToaNha
                    {
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        TenToaNha = reader.GetString("TenToaNha"),
                        DiaChi = reader.IsDBNull("DiaChi") ? null : reader.GetString("DiaChi"),
                        SoTang = reader.IsDBNull("SoTang") ? null : reader.GetInt32("SoTang"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = building });
                }

                return NotFound(new { success = false, message = "Không tìm thấy tòa nhà" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ToaNha model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_ToaNha_Insert", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@TenToaNha", model.TenToaNha);
                command.Parameters.AddWithValue("@DiaChi", (object?)model.DiaChi ?? DBNull.Value);
                command.Parameters.AddWithValue("@SoTang", (object?)model.SoTang ?? DBNull.Value);
                command.Parameters.AddWithValue("@MoTa", (object?)model.MoTa ?? DBNull.Value);

                var newId = await command.ExecuteScalarAsync();
                model.MaToaNha = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;

                return CreatedAtAction(nameof(GetById), new { id = model.MaToaNha }, new { success = true, data = model });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ToaNha model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_ToaNha_Update", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaToaNha", id);
                command.Parameters.AddWithValue("@TenToaNha", model.TenToaNha);
                command.Parameters.AddWithValue("@DiaChi", (object?)model.DiaChi ?? DBNull.Value);
                command.Parameters.AddWithValue("@SoTang", (object?)model.SoTang ?? DBNull.Value);
                command.Parameters.AddWithValue("@MoTa", (object?)model.MoTa ?? DBNull.Value);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy tòa nhà" });

                // Fetch lại building sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_ToaNha_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                getCommand.Parameters.AddWithValue("@MaToaNha", id);

                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedBuilding = new ToaNha
                    {
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        TenToaNha = reader.GetString("TenToaNha"),
                        DiaChi = reader.IsDBNull("DiaChi") ? null : reader.GetString("DiaChi"),
                        SoTang = reader.IsDBNull("SoTang") ? null : reader.GetInt32("SoTang"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = updatedBuilding, message = "Cập nhật tòa nhà thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật tòa nhà thành công" });
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

                using var command = new SqlCommand("sp_ToaNha_Delete", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaToaNha", id);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy tòa nhà" });

                return Ok(new { success = true, message = "Xóa tòa nhà thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}

