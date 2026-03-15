using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/fee-configs")]
    [Authorize(Roles = "Admin")]
    public class CauHinhPhiController : ControllerBase
    {
        private readonly string _connectionString;

        public CauHinhPhiController(IConfiguration configuration)
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

                using var command = new SqlCommand("sp_CauHinhPhi_GetAll", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                using var reader = await command.ExecuteReaderAsync();
                var configs = new List<CauHinhPhi>();

                while (await reader.ReadAsync())
                {
                    configs.Add(new CauHinhPhi
                    {
                        MaCauHinh = reader.GetInt32("MaCauHinh"),
                        Loai = reader.GetString("Loai"),
                        MucToiThieu = reader.GetDecimal("MucToiThieu"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = configs });
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

                using var command = new SqlCommand("sp_CauHinhPhi_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaCauHinh", id);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var config = new CauHinhPhi
                    {
                        MaCauHinh = reader.GetInt32("MaCauHinh"),
                        Loai = reader.GetString("Loai"),
                        MucToiThieu = reader.GetDecimal("MucToiThieu"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                return Ok(new { success = true, data = config });
                }

                return NotFound(new { success = false, message = "Không tìm thấy cấu hình phí" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("by-type/{loai}")]
        public async Task<IActionResult> GetByLoai(string loai)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_CauHinhPhi_GetByLoai", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@Loai", loai);

                using var reader = await command.ExecuteReaderAsync();
                var configs = new List<CauHinhPhi>();

                while (await reader.ReadAsync())
                {
                    configs.Add(new CauHinhPhi
                    {
                        MaCauHinh = reader.GetInt32("MaCauHinh"),
                        Loai = reader.GetString("Loai"),
                        MucToiThieu = reader.GetDecimal("MucToiThieu"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = configs });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CauHinhPhi model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_CauHinhPhi_Insert", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@Loai", model.Loai);
                command.Parameters.AddWithValue("@MucToiThieu", model.MucToiThieu);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@NguoiTao", (object?)User.FindFirst("MaTaiKhoan")?.Value ?? DBNull.Value);

                var newId = await command.ExecuteScalarAsync();
                model.MaCauHinh = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;

                return CreatedAtAction(nameof(GetById), new { id = model.MaCauHinh }, new { success = true, data = model });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CauHinhPhi model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_CauHinhPhi_Update", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaCauHinh", id);
                command.Parameters.AddWithValue("@Loai", model.Loai);
                command.Parameters.AddWithValue("@MucToiThieu", model.MucToiThieu);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@NguoiCapNhat", (object?)User.FindFirst("MaTaiKhoan")?.Value ?? DBNull.Value);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy cấu hình phí" });

                // Fetch lại config sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_CauHinhPhi_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                getCommand.Parameters.AddWithValue("@MaCauHinh", id);

                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedConfig = new CauHinhPhi
                    {
                        MaCauHinh = reader.GetInt32("MaCauHinh"),
                        Loai = reader.GetString("Loai"),
                        MucToiThieu = reader.GetDecimal("MucToiThieu"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = updatedConfig, message = "Cập nhật cấu hình phí thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật cấu hình phí thành công" });
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

                using var command = new SqlCommand("sp_CauHinhPhi_Delete", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaCauHinh", id);
                command.Parameters.AddWithValue("@NguoiCapNhat", (object?)User.FindFirst("MaTaiKhoan")?.Value ?? DBNull.Value);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy cấu hình phí" });

                return Ok(new { success = true, message = "Xóa cấu hình phí thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}

