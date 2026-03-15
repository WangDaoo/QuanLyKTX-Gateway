using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Linq;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/receipts")]
[Authorize(Roles = "Admin,Officer")]
    public class ReceiptsController : ControllerBase
    {
        private readonly string _connectionString;

        public ReceiptsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("KTX") ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? maSinhVien = null, [FromQuery] int? maHoaDon = null, [FromQuery] DateTime? ngay = null)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                
                List<BienLaiThu> allItems;
                
                // Nếu có maSinhVien, dùng SP riêng để lọc hiệu quả hơn
                if (maSinhVien.HasValue)
                {
                    using var command = new SqlCommand("sp_BienLaiThu_GetBySinhVien", connection) { CommandType = CommandType.StoredProcedure };
                    command.Parameters.AddWithValue("@MaSinhVien", maSinhVien.Value);
                    using var reader = await command.ExecuteReaderAsync();
                    allItems = new List<BienLaiThu>();
                    while (await reader.ReadAsync())
                    {
                        allItems.Add(new BienLaiThu
                        {
                            MaBienLai = reader.GetInt32("MaBienLai"),
                            MaHoaDon = reader.GetInt32("MaHoaDon"),
                            SoTienThu = reader.GetDecimal("SoTienThu"),
                            NgayThu = reader.GetDateTime("NgayThu"),
                            PhuongThucThanhToan = reader.GetString("PhuongThucThanhToan"),
                            NguoiThu = reader.IsDBNull("NguoiThu") ? null : reader.GetString("NguoiThu"),
                            GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                            IsDeleted = reader.GetBoolean("IsDeleted"),
                            NgayTao = reader.GetDateTime("NgayTao"),
                            NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                            NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                            NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                        });
                    }
                }
                else
                {
                    using var command = new SqlCommand("sp_BienLaiThu_GetAll", connection) { CommandType = CommandType.StoredProcedure };
                    using var reader = await command.ExecuteReaderAsync();
                    allItems = new List<BienLaiThu>();
                    while (await reader.ReadAsync())
                    {
                        allItems.Add(new BienLaiThu
                        {
                            MaBienLai = reader.GetInt32("MaBienLai"),
                            MaHoaDon = reader.GetInt32("MaHoaDon"),
                            SoTienThu = reader.GetDecimal("SoTienThu"),
                            NgayThu = reader.GetDateTime("NgayThu"),
                            PhuongThucThanhToan = reader.GetString("PhuongThucThanhToan"),
                            NguoiThu = reader.IsDBNull("NguoiThu") ? null : reader.GetString("NguoiThu"),
                            GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                            IsDeleted = reader.GetBoolean("IsDeleted"),
                            NgayTao = reader.GetDateTime("NgayTao"),
                            NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                            NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                            NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                        });
                    }
                }

                // Lọc kết quả theo query parameters còn lại
                var items = allItems;
                if (maHoaDon.HasValue)
                    items = items.Where(i => i.MaHoaDon == maHoaDon.Value).ToList();
                if (ngay.HasValue)
                    items = items.Where(i => i.NgayThu.Date == ngay.Value.Date).ToList();
                
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
                using var command = new SqlCommand("sp_BienLaiThu_GetById", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaBienLai", id);
                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var item = new BienLaiThu
                    {
                        MaBienLai = reader.GetInt32("MaBienLai"),
                        MaHoaDon = reader.GetInt32("MaHoaDon"),
                        SoTienThu = reader.GetDecimal("SoTienThu"),
                        NgayThu = reader.GetDateTime("NgayThu"),
                        PhuongThucThanhToan = reader.GetString("PhuongThucThanhToan"),
                        NguoiThu = reader.IsDBNull("NguoiThu") ? null : reader.GetString("NguoiThu"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = item });
                }
                return NotFound(new { success = false, message = "Không tìm thấy biên lai" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BienLaiThu model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_BienLaiThu_Insert", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaHoaDon", model.MaHoaDon);
                command.Parameters.AddWithValue("@SoTienThu", model.SoTienThu);
                command.Parameters.AddWithValue("@NgayThu", model.NgayThu);
                command.Parameters.AddWithValue("@PhuongThucThanhToan", model.PhuongThucThanhToan);
                command.Parameters.AddWithValue("@NguoiThu", (object?)model.NguoiThu ?? DBNull.Value);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiTao", (object?)model.NguoiTao ?? DBNull.Value);
                var newId = await command.ExecuteScalarAsync();
                model.MaBienLai = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;
                return CreatedAtAction(nameof(GetById), new { id = model.MaBienLai }, new { success = true, data = model });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] BienLaiThu model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_BienLaiThu_Update", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaBienLai", id);
                command.Parameters.AddWithValue("@MaHoaDon", model.MaHoaDon);
                command.Parameters.AddWithValue("@SoTienThu", model.SoTienThu);
                command.Parameters.AddWithValue("@NgayThu", model.NgayThu);
                command.Parameters.AddWithValue("@PhuongThucThanhToan", model.PhuongThucThanhToan);
                command.Parameters.AddWithValue("@NguoiThu", (object?)model.NguoiThu ?? DBNull.Value);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiCapNhat", (object?)model.NguoiCapNhat ?? DBNull.Value);
                var rows = await command.ExecuteNonQueryAsync();
                if (rows == 0) return NotFound(new { success = false, message = "Không tìm thấy biên lai" });

                // Fetch lại receipt sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_BienLaiThu_GetById", connection) { CommandType = CommandType.StoredProcedure };
                getCommand.Parameters.AddWithValue("@MaBienLai", id);
                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedReceipt = new BienLaiThu
                    {
                        MaBienLai = reader.GetInt32("MaBienLai"),
                        MaHoaDon = reader.GetInt32("MaHoaDon"),
                        SoTienThu = reader.GetDecimal("SoTienThu"),
                        NgayThu = reader.GetDateTime("NgayThu"),
                        PhuongThucThanhToan = reader.GetString("PhuongThucThanhToan"),
                        NguoiThu = reader.IsDBNull("NguoiThu") ? null : reader.GetString("NguoiThu"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = updatedReceipt, message = "Cập nhật biên lai thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật biên lai thành công" });
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
                using var command = new SqlCommand("sp_BienLaiThu_Delete", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaBienLai", id);
                var rows = await command.ExecuteNonQueryAsync();
                if (rows == 0) return NotFound(new { success = false, message = "Không tìm thấy biên lai" });
                return Ok(new { success = true, message = "Xóa biên lai thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}


