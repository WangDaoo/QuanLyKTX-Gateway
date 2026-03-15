using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/beds")]
    [Authorize(Roles = "Admin,Officer")]
    public class BedsController : ControllerBase
    {
        private readonly string _connectionString;

        public BedsController(IConfiguration configuration)
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

                using var command = new SqlCommand("sp_Giuong_GetAll", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                using var reader = await command.ExecuteReaderAsync();
                var beds = new List<Giuong>();

                while (await reader.ReadAsync())
                {
                    beds.Add(new Giuong
                    {
                        MaGiuong = reader.GetInt32("MaGiuong"),
                        MaPhong = reader.GetInt32("MaPhong"),
                        SoGiuong = reader.GetString("SoGiuong"),
                        TrangThai = reader.GetString("TrangThai"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = beds });
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

                using var command = new SqlCommand("sp_Giuong_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaGiuong", id);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var bed = new Giuong
                    {
                        MaGiuong = reader.GetInt32("MaGiuong"),
                        MaPhong = reader.GetInt32("MaPhong"),
                        SoGiuong = reader.GetString("SoGiuong"),
                        TrangThai = reader.GetString("TrangThai"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = bed });
                }

                return NotFound(new { success = false, message = "Không tìm thấy giường" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Giuong model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_Giuong_Insert", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaPhong", model.MaPhong);
                command.Parameters.AddWithValue("@SoGiuong", model.SoGiuong);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@MoTa", (object?)model.MoTa ?? DBNull.Value);

                var newId = await command.ExecuteScalarAsync();
                model.MaGiuong = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;

                return CreatedAtAction(nameof(GetById), new { id = model.MaGiuong }, new { success = true, data = model });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Giuong model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_Giuong_Update", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaGiuong", id);
                command.Parameters.AddWithValue("@MaPhong", model.MaPhong);
                command.Parameters.AddWithValue("@SoGiuong", model.SoGiuong);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@MoTa", (object?)model.MoTa ?? DBNull.Value);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy giường" });

                // Fetch lại bed sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_Giuong_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                getCommand.Parameters.AddWithValue("@MaGiuong", id);

                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedBed = new Giuong
                    {
                        MaGiuong = reader.GetInt32("MaGiuong"),
                        MaPhong = reader.GetInt32("MaPhong"),
                        SoGiuong = reader.GetString("SoGiuong"),
                        TrangThai = reader.GetString("TrangThai"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = updatedBed, message = "Cập nhật giường thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật giường thành công" });
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

                using var command = new SqlCommand("sp_Giuong_Delete", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaGiuong", id);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy giường" });

                return Ok(new { success = true, message = "Xóa giường thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}

