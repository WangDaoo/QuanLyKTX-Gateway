using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/fees")]
    [Authorize(Roles = "Admin,Officer")]
    public class FeesController : ControllerBase
    {
        private readonly string _connectionString;

        public FeesController(IConfiguration configuration)
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

                using var command = new SqlCommand("sp_MucPhi_GetAll", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                using var reader = await command.ExecuteReaderAsync();
                var fees = new List<MucPhi>();

                while (await reader.ReadAsync())
                {
                    fees.Add(new MucPhi
                    {
                        MaMucPhi = reader.GetInt32("MaMucPhi"),
                        TenMucPhi = reader.GetString("TenMucPhi"),
                        LoaiPhi = reader.GetString("LoaiPhi"),
                        GiaTien = reader.GetDecimal("GiaTien"),
                        DonVi = reader.IsDBNull("DonVi") ? null : reader.GetString("DonVi"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = fees });
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

                using var command = new SqlCommand("sp_MucPhi_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaMucPhi", id);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var fee = new MucPhi
                    {
                        MaMucPhi = reader.GetInt32("MaMucPhi"),
                        TenMucPhi = reader.GetString("TenMucPhi"),
                        LoaiPhi = reader.GetString("LoaiPhi"),
                        GiaTien = reader.GetDecimal("GiaTien"),
                        DonVi = reader.IsDBNull("DonVi") ? null : reader.GetString("DonVi"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = fee });
                }

                return NotFound(new { success = false, message = "Không tìm thấy mức phí" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MucPhi model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_MucPhi_Insert", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@TenMucPhi", model.TenMucPhi);
                command.Parameters.AddWithValue("@LoaiPhi", model.LoaiPhi);
                command.Parameters.AddWithValue("@GiaTien", model.GiaTien);
                command.Parameters.AddWithValue("@DonVi", (object?)model.DonVi ?? DBNull.Value);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiTao", (object?)model.NguoiTao ?? DBNull.Value);

                var newId = await command.ExecuteScalarAsync();
                model.MaMucPhi = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;

                return CreatedAtAction(nameof(GetById), new { id = model.MaMucPhi }, new { success = true, data = model });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] MucPhi model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_MucPhi_Update", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaMucPhi", id);
                command.Parameters.AddWithValue("@TenMucPhi", model.TenMucPhi);
                command.Parameters.AddWithValue("@LoaiPhi", model.LoaiPhi);
                command.Parameters.AddWithValue("@GiaTien", model.GiaTien);
                command.Parameters.AddWithValue("@DonVi", (object?)model.DonVi ?? DBNull.Value);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiCapNhat", (object?)model.NguoiCapNhat ?? DBNull.Value);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy mức phí" });

                // Fetch lại fee sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_MucPhi_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                getCommand.Parameters.AddWithValue("@MaMucPhi", id);

                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedFee = new MucPhi
                    {
                        MaMucPhi = reader.GetInt32("MaMucPhi"),
                        TenMucPhi = reader.GetString("TenMucPhi"),
                        LoaiPhi = reader.GetString("LoaiPhi"),
                        GiaTien = reader.GetDecimal("GiaTien"),
                        DonVi = reader.IsDBNull("DonVi") ? null : reader.GetString("DonVi"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = updatedFee, message = "Cập nhật mức phí thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật mức phí thành công" });
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

                using var command = new SqlCommand("sp_MucPhi_Delete", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaMucPhi", id);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy mức phí" });

                return Ok(new { success = true, message = "Xóa mức phí thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("by-type/{loaiPhi}")]
        public async Task<IActionResult> GetByLoaiPhi(string loaiPhi)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_MucPhi_GetByLoaiPhi", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@LoaiPhi", loaiPhi);

                using var reader = await command.ExecuteReaderAsync();
                var fees = new List<MucPhi>();

                while (await reader.ReadAsync())
                {
                    fees.Add(new MucPhi
                    {
                        MaMucPhi = reader.GetInt32("MaMucPhi"),
                        TenMucPhi = reader.GetString("TenMucPhi"),
                        LoaiPhi = reader.GetString("LoaiPhi"),
                        GiaTien = reader.GetDecimal("GiaTien"),
                        DonVi = reader.IsDBNull("DonVi") ? null : reader.GetString("DonVi"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = fees });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}


