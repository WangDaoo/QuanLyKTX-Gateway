using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;
using ExcelDataReader;
using OfficeOpenXml;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/meter-readings")]
    [Authorize(Roles = "Admin,Officer")]
    public class MeterReadingsController : ControllerBase
    {
        private readonly string _connectionString;

        public MeterReadingsController(IConfiguration configuration)
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

                using var command = new SqlCommand("sp_ChiSoDienNuoc_GetAll", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                using var reader = await command.ExecuteReaderAsync();
                var readings = new List<ChiSoDienNuoc>();

                while (await reader.ReadAsync())
                {
                    readings.Add(new ChiSoDienNuoc
                    {
                        MaChiSo = reader.GetInt32("MaChiSo"),
                        MaPhong = reader.GetInt32("MaPhong"),
                        Thang = reader.GetInt32("Thang"),
                        Nam = reader.GetInt32("Nam"),
                        ChiSoDien = reader.GetInt32("ChiSoDien"),
                        ChiSoNuoc = reader.GetInt32("ChiSoNuoc"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiGhi = reader.IsDBNull("NguoiGhi") ? null : reader.GetString("NguoiGhi"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = readings });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ChiSoDienNuoc model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_ChiSoDienNuoc_Create", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaPhong", model.MaPhong);
                command.Parameters.AddWithValue("@Thang", model.Thang);
                command.Parameters.AddWithValue("@Nam", model.Nam);
                command.Parameters.AddWithValue("@ChiSoDien", model.ChiSoDien);
                command.Parameters.AddWithValue("@ChiSoNuoc", model.ChiSoNuoc);
                command.Parameters.AddWithValue("@NguoiGhi", (object?)model.NguoiGhi ?? DBNull.Value);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiTao", (object?)model.NguoiTao ?? DBNull.Value);

                var newId = await command.ExecuteScalarAsync();
                model.MaChiSo = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;

                return CreatedAtAction(nameof(GetById), new { id = model.MaChiSo }, model);
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

                using var command = new SqlCommand("sp_ChiSoDienNuoc_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaChiSo", id);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var reading = new ChiSoDienNuoc
                    {
                        MaChiSo = reader.GetInt32("MaChiSo"),
                        MaPhong = reader.GetInt32("MaPhong"),
                        Thang = reader.GetInt32("Thang"),
                        Nam = reader.GetInt32("Nam"),
                        ChiSoDien = reader.GetInt32("ChiSoDien"),
                        ChiSoNuoc = reader.GetInt32("ChiSoNuoc"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiGhi = reader.IsDBNull("NguoiGhi") ? null : reader.GetString("NguoiGhi"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = reading });
                }

                return NotFound(new { success = false, message = "Không tìm thấy chỉ số" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ChiSoDienNuoc model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_ChiSoDienNuoc_Update", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaChiSo", id);
                command.Parameters.AddWithValue("@MaPhong", model.MaPhong);
                command.Parameters.AddWithValue("@Thang", model.Thang);
                command.Parameters.AddWithValue("@Nam", model.Nam);
                command.Parameters.AddWithValue("@ChiSoDien", model.ChiSoDien);
                command.Parameters.AddWithValue("@ChiSoNuoc", model.ChiSoNuoc);
                command.Parameters.AddWithValue("@NguoiGhi", (object?)model.NguoiGhi ?? DBNull.Value);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0) return NotFound(new { success = false, message = "Không tìm thấy chỉ số" });

                // Fetch lại meter reading sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_ChiSoDienNuoc_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                getCommand.Parameters.AddWithValue("@MaChiSo", id);

                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedReading = new ChiSoDienNuoc
                    {
                        MaChiSo = reader.GetInt32("MaChiSo"),
                        MaPhong = reader.GetInt32("MaPhong"),
                        Thang = reader.GetInt32("Thang"),
                        Nam = reader.GetInt32("Nam"),
                        ChiSoDien = reader.GetInt32("ChiSoDien"),
                        ChiSoNuoc = reader.GetInt32("ChiSoNuoc"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiGhi = reader.IsDBNull("NguoiGhi") ? null : reader.GetString("NguoiGhi"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = updatedReading, message = "Cập nhật chỉ số thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật chỉ số thành công" });
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

                using var command = new SqlCommand("sp_ChiSoDienNuoc_Delete", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaChiSo", id);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0) return NotFound(new { success = false, message = "Không tìm thấy chỉ số" });
                return Ok(new { success = true, message = "Xóa chỉ số thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost("import-excel")]
        public async Task<IActionResult> ImportFromExcel(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, message = "Vui lòng chọn file Excel" });

                if (!file.FileName.EndsWith(".xlsx") && !file.FileName.EndsWith(".xls"))
                    return BadRequest(new { success = false, message = "Chỉ hỗ trợ file Excel (.xlsx, .xls)" });

                using var stream = file.OpenReadStream();
                using var reader = ExcelReaderFactory.CreateReader(stream);
                var dataSet = reader.AsDataSet();
                var dataTable = dataSet.Tables[0];

                var importedCount = 0;
                var errorCount = 0;
                var errors = new List<string>();

                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                for (int i = 1; i < dataTable.Rows.Count; i++)
                {
                    try
                    {
                        var row = dataTable.Rows[i];
                        var maPhong = Convert.ToInt32(row[0]);
                        var thang = Convert.ToInt32(row[1]);
                        var nam = Convert.ToInt32(row[2]);
                        var chiSoDien = Convert.ToInt32(row[3]);
                        var chiSoNuoc = Convert.ToInt32(row[4]);
                        var nguoiGhi = row[5]?.ToString() ?? "Import Excel";

                        if (maPhong <= 0 || thang < 1 || thang > 12 || nam < 2020 || nam > 2030)
                        {
                            errors.Add($"Dòng {i + 1}: Dữ liệu không hợp lệ");
                            errorCount++;
                            continue;
                        }

                        using var checkCommand = new SqlCommand("SELECT COUNT(*) FROM Phong WHERE MaPhong = @MaPhong AND IsDeleted = 0", connection);
                        checkCommand.Parameters.AddWithValue("@MaPhong", maPhong);
                        var phongExists = (int)await checkCommand.ExecuteScalarAsync() > 0;
                        if (!phongExists)
                        {
                            errors.Add($"Dòng {i + 1}: Phòng {maPhong} không tồn tại");
                            errorCount++;
                            continue;
                        }

                        using var existCommand = new SqlCommand("SELECT COUNT(*) FROM ChiSoDienNuoc WHERE MaPhong = @MaPhong AND Thang = @Thang AND Nam = @Nam AND IsDeleted = 0", connection);
                        existCommand.Parameters.AddWithValue("@MaPhong", maPhong);
                        existCommand.Parameters.AddWithValue("@Thang", thang);
                        existCommand.Parameters.AddWithValue("@Nam", nam);
                        var alreadyExists = (int)await existCommand.ExecuteScalarAsync() > 0;
                        if (alreadyExists)
                        {
                            errors.Add($"Dòng {i + 1}: Đã có chỉ số cho phòng {maPhong} tháng {thang}/{nam}");
                            errorCount++;
                            continue;
                        }

                        using var insertCommand = new SqlCommand("sp_ChiSoDienNuoc_Insert", connection) { CommandType = CommandType.StoredProcedure };
                        insertCommand.Parameters.AddWithValue("@MaPhong", maPhong);
                        insertCommand.Parameters.AddWithValue("@Thang", thang);
                        insertCommand.Parameters.AddWithValue("@Nam", nam);
                        insertCommand.Parameters.AddWithValue("@ChiSoDien", chiSoDien);
                        insertCommand.Parameters.AddWithValue("@ChiSoNuoc", chiSoNuoc);
                        insertCommand.Parameters.AddWithValue("@NguoiGhi", nguoiGhi);

                        await insertCommand.ExecuteNonQueryAsync();
                        importedCount++;
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Dòng {i + 1}: {ex.Message}");
                        errorCount++;
                    }
                }

                return Ok(new { success = true, data = new { importedCount, errorCount, errors = errors.Take(10).ToList(), totalErrors = errors.Count }, message = "Import hoàn thành" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi import Excel: {ex.Message}" });
            }
        }

        [HttpGet("template")]
        public IActionResult DownloadTemplate()
        {
            try
            {
                using var package = new OfficeOpenXml.ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("ChiSoDienNuoc");
                worksheet.Cells[1, 1].Value = "MaPhong";
                worksheet.Cells[1, 2].Value = "Thang";
                worksheet.Cells[1, 3].Value = "Nam";
                worksheet.Cells[1, 4].Value = "ChiSoDien";
                worksheet.Cells[1, 5].Value = "ChiSoNuoc";
                worksheet.Cells[1, 6].Value = "NguoiGhi";
                worksheet.Cells[2, 1].Value = 1;
                worksheet.Cells[2, 2].Value = 1;
                worksheet.Cells[2, 3].Value = 2024;
                worksheet.Cells[2, 4].Value = 100;
                worksheet.Cells[2, 5].Value = 50;
                worksheet.Cells[2, 6].Value = "Admin";
                var stream = new MemoryStream();
                package.SaveAs(stream);
                stream.Position = 0;
                return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Template_ChiSoDienNuoc.xlsx");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi tạo template: {ex.Message}" });
            }
        }

        [HttpGet("by-room/{maPhong:int}")]
        public async Task<IActionResult> GetByPhong(int maPhong)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_ChiSoDienNuoc_GetByPhong", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaPhong", maPhong);

                using var reader = await command.ExecuteReaderAsync();
                var readings = new List<ChiSoDienNuoc>();

                while (await reader.ReadAsync())
                {
                    readings.Add(new ChiSoDienNuoc
                    {
                        MaChiSo = reader.GetInt32("MaChiSo"),
                        MaPhong = reader.GetInt32("MaPhong"),
                        Thang = reader.GetInt32("Thang"),
                        Nam = reader.GetInt32("Nam"),
                        ChiSoDien = reader.GetInt32("ChiSoDien"),
                        ChiSoNuoc = reader.GetInt32("ChiSoNuoc"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiGhi = reader.IsDBNull("NguoiGhi") ? null : reader.GetString("NguoiGhi"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = readings });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("by-month/{thang:int}/{nam:int}")]
        public async Task<IActionResult> GetByThangNam(int thang, int nam)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_ChiSoDienNuoc_GetByThangNam", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@Thang", thang);
                command.Parameters.AddWithValue("@Nam", nam);

                using var reader = await command.ExecuteReaderAsync();
                var readings = new List<ChiSoDienNuoc>();

                while (await reader.ReadAsync())
                {
                    readings.Add(new ChiSoDienNuoc
                    {
                        MaChiSo = reader.GetInt32("MaChiSo"),
                        MaPhong = reader.GetInt32("MaPhong"),
                        Thang = reader.GetInt32("Thang"),
                        Nam = reader.GetInt32("Nam"),
                        ChiSoDien = reader.GetInt32("ChiSoDien"),
                        ChiSoNuoc = reader.GetInt32("ChiSoNuoc"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiGhi = reader.IsDBNull("NguoiGhi") ? null : reader.GetString("NguoiGhi"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = readings });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}













