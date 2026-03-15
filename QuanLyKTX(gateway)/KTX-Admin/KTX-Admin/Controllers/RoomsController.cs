using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/rooms")]
    [Authorize(Roles = "Admin,Officer")]
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

                using var command = new SqlCommand("sp_Phong_GetAll", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                using var reader = await command.ExecuteReaderAsync();
                var rooms = new List<Phong>();

                while (await reader.ReadAsync())
                {
                    rooms.Add(new Phong
                    {
                        MaPhong = reader.GetInt32("MaPhong"),
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        SoPhong = reader.GetString("SoPhong"),
                        SoGiuong = reader.GetInt32("SoGiuong"),
                        LoaiPhong = reader.GetString("LoaiPhong"),
                        GiaPhong = reader.GetDecimal("GiaPhong"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        TrangThai = reader.GetString("TrangThai"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat"),
                        TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha")
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

                using var command = new SqlCommand("sp_Phong_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaPhong", id);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var room = new Phong
                    {
                        MaPhong = reader.GetInt32("MaPhong"),
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        SoPhong = reader.GetString("SoPhong"),
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Phong model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_Phong_Insert", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaToaNha", model.MaToaNha);
                command.Parameters.AddWithValue("@SoPhong", model.SoPhong);
                command.Parameters.AddWithValue("@SoGiuong", model.SoGiuong);
                command.Parameters.AddWithValue("@LoaiPhong", model.LoaiPhong);
                command.Parameters.AddWithValue("@GiaPhong", model.GiaPhong);
                command.Parameters.AddWithValue("@MoTa", (object?)model.MoTa ?? DBNull.Value);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@NguoiTao", (object?)model.NguoiTao ?? DBNull.Value);

                var newId = await command.ExecuteScalarAsync();
                model.MaPhong = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;

                return CreatedAtAction(nameof(GetById), new { id = model.MaPhong }, new { success = true, data = model });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Phong model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_Phong_Update", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaPhong", id);
                command.Parameters.AddWithValue("@MaToaNha", model.MaToaNha);
                command.Parameters.AddWithValue("@SoPhong", model.SoPhong);
                command.Parameters.AddWithValue("@SoGiuong", model.SoGiuong);
                command.Parameters.AddWithValue("@LoaiPhong", model.LoaiPhong);
                command.Parameters.AddWithValue("@GiaPhong", model.GiaPhong);
                command.Parameters.AddWithValue("@MoTa", (object?)model.MoTa ?? DBNull.Value);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@NguoiCapNhat", (object?)model.NguoiCapNhat ?? DBNull.Value);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy phòng" });

                // Fetch lại room sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_Phong_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                getCommand.Parameters.AddWithValue("@MaPhong", id);

                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedRoom = new Phong
                    {
                        MaPhong = reader.GetInt32("MaPhong"),
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        SoPhong = reader.GetString("SoPhong"),
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
                    return Ok(new { success = true, data = updatedRoom, message = "Cập nhật phòng thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật phòng thành công" });
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

                using var command = new SqlCommand("sp_Phong_Delete", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaPhong", id);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy phòng" });

                return Ok(new { success = true, message = "Xóa phòng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("empty")]
        public async Task<IActionResult> GetEmptyRooms()
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_Phong_GetEmpty", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                using var reader = await command.ExecuteReaderAsync();
                var rooms = new List<object>();

                while (await reader.ReadAsync())
                {
                    rooms.Add(new
                    {
                        MaPhong = reader.GetInt32("MaPhong"),
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        SoPhong = reader.GetString("SoPhong"),
                        SoGiuong = reader.GetInt32("SoGiuong"),
                        LoaiPhong = reader.GetString("LoaiPhong"),
                        GiaPhong = reader.GetDecimal("GiaPhong"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        TrangThai = reader.GetString("TrangThai"),
                        TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha"),
                        SoGiuongTrong = reader.GetInt32("SoGiuongTrong")
                    });
                }

                return Ok(new { success = true, data = rooms });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}


