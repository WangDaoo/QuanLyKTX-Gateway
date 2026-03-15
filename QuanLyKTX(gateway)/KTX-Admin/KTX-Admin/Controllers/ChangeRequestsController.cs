using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/change-requests")] 
    [Authorize(Roles = "Admin,Officer")]
    public class ChangeRequestsController : ControllerBase
    {
        private readonly string _connectionString;

        public ChangeRequestsController(IConfiguration configuration)
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
                using var command = new SqlCommand("sp_YeuCauChuyenPhong_GetAll", connection) { CommandType = CommandType.StoredProcedure };
                using var reader = await command.ExecuteReaderAsync();
                var items = new List<YeuCauChuyenPhong>();
                while (await reader.ReadAsync())
                {
                    items.Add(new YeuCauChuyenPhong
                    {
                        MaYeuCau = reader.GetInt32("MaYeuCau"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        PhongHienTai = reader.GetInt32("PhongHienTai"),
                        PhongMongMuon = reader.IsDBNull("PhongMongMuon") ? null : reader.GetInt32("PhongMongMuon"),
                        LyDo = reader.GetString("LyDo"),
                        NgayYeuCau = reader.GetDateTime("NgayYeuCau"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
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
                using var command = new SqlCommand("sp_YeuCauChuyenPhong_GetById", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaYeuCau", id);
                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var item = new YeuCauChuyenPhong
                    {
                        MaYeuCau = reader.GetInt32("MaYeuCau"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        PhongHienTai = reader.GetInt32("PhongHienTai"),
                        PhongMongMuon = reader.IsDBNull("PhongMongMuon") ? null : reader.GetInt32("PhongMongMuon"),
                        LyDo = reader.GetString("LyDo"),
                        NgayYeuCau = reader.GetDateTime("NgayYeuCau"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = item });
                }
                return NotFound(new { success = false, message = "Không tìm thấy yêu cầu chuyển phòng" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] YeuCauChuyenPhong model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_YeuCauChuyenPhong_Insert", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
                command.Parameters.AddWithValue("@PhongHienTai", model.PhongHienTai);
                command.Parameters.AddWithValue("@PhongMongMuon", (object?)model.PhongMongMuon ?? DBNull.Value);
                command.Parameters.AddWithValue("@LyDo", model.LyDo);
                command.Parameters.AddWithValue("@NgayYeuCau", model.NgayYeuCau);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiTao", User.Identity?.Name ?? "Admin");
                var newId = await command.ExecuteScalarAsync();
                model.MaYeuCau = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;
                return CreatedAtAction(nameof(GetById), new { id = model.MaYeuCau }, new { success = true, data = model });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] YeuCauChuyenPhong model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_YeuCauChuyenPhong_Update", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaYeuCau", id);
                command.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
                command.Parameters.AddWithValue("@PhongHienTai", model.PhongHienTai);
                command.Parameters.AddWithValue("@PhongMongMuon", (object?)model.PhongMongMuon ?? DBNull.Value);
                command.Parameters.AddWithValue("@LyDo", model.LyDo);
                command.Parameters.AddWithValue("@NgayYeuCau", model.NgayYeuCau);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                var rows = await command.ExecuteNonQueryAsync();
                if (rows == 0) return NotFound(new { success = false, message = "Không tìm thấy yêu cầu chuyển phòng" });

                // Fetch lại change request sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_YeuCauChuyenPhong_GetById", connection) { CommandType = CommandType.StoredProcedure };
                getCommand.Parameters.AddWithValue("@MaYeuCau", id);
                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedChangeRequest = new YeuCauChuyenPhong
                    {
                        MaYeuCau = reader.GetInt32("MaYeuCau"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        PhongHienTai = reader.GetInt32("PhongHienTai"),
                        PhongMongMuon = reader.IsDBNull("PhongMongMuon") ? null : reader.GetInt32("PhongMongMuon"),
                        LyDo = reader.GetString("LyDo"),
                        NgayYeuCau = reader.GetDateTime("NgayYeuCau"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = updatedChangeRequest, message = "Cập nhật yêu cầu chuyển phòng thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật yêu cầu chuyển phòng thành công" });
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
                using var command = new SqlCommand("sp_YeuCauChuyenPhong_Delete", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaYeuCau", id);
                var rows = await command.ExecuteNonQueryAsync();
                if (rows == 0) return NotFound(new { success = false, message = "Không tìm thấy yêu cầu chuyển phòng" });
                return Ok(new { success = true, message = "Xóa yêu cầu chuyển phòng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}


