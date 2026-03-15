using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize(Roles = "Admin,Officer")]
    public class ReportsController : ControllerBase
    {
        private readonly string _connectionString;

        public ReportsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("KTX") ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpGet("occupancy-rate")]
        public async Task<IActionResult> GetOccupancyRate([FromQuery] int thang, [FromQuery] int nam)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_BaoCaoTyLeLapDay", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@Thang", thang);
                command.Parameters.AddWithValue("@Nam", nam);

                using var reader = await command.ExecuteReaderAsync();
                var report = new List<object>();

                while (await reader.ReadAsync())
                {
                    report.Add(new
                    {
                        TenToaNha = reader.GetString("TenToaNha"),
                        TongSoPhong = reader.GetInt32("TongSoPhong"),
                        SoPhongCoSinhVien = reader.GetInt32("SoPhongCoSinhVien"),
                        TyLeLapDay = reader.GetDecimal("TyLeLapDay")
                    });
                }

                return Ok(new { success = true, data = report });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueReport([FromQuery] int thang, [FromQuery] int nam)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_BaoCaoDoanhThu", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@Thang", thang);
                command.Parameters.AddWithValue("@Nam", nam);

                using var reader = await command.ExecuteReaderAsync();
                var report = new List<object>();

                while (await reader.ReadAsync())
                {
                    report.Add(new
                    {
                        Thang = reader.GetInt32("Thang"),
                        Nam = reader.GetInt32("Nam"),
                        TongSoHoaDon = reader.GetInt32("TongSoHoaDon"),
                        TongDoanhThu = reader.GetDecimal("TongDoanhThu"),
                        DoanhThuDaThu = reader.GetDecimal("DoanhThuDaThu"),
                        DoanhThuChuaThu = reader.GetDecimal("DoanhThuChuaThu")
                    });
                }

                return Ok(new { success = true, data = report });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("debt")]
        public async Task<IActionResult> GetDebtReport([FromQuery] int? thang = null, [FromQuery] int? nam = null)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_BaoCaoCongNo", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                if (thang.HasValue) command.Parameters.AddWithValue("@Thang", thang.Value); else command.Parameters.AddWithValue("@Thang", DBNull.Value);
                if (nam.HasValue) command.Parameters.AddWithValue("@Nam", nam.Value); else command.Parameters.AddWithValue("@Nam", DBNull.Value);

                using var reader = await command.ExecuteReaderAsync();
                var report = new List<object>();

                while (await reader.ReadAsync())
                {
                    report.Add(new
                    {
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        HoTen = reader.GetString("HoTen"),
                        MSSV = reader.GetString("MSSV"),
                        Lop = reader.IsDBNull("Lop") ? null : reader.GetString("Lop"),
                        Khoa = reader.IsDBNull("Khoa") ? null : reader.GetString("Khoa"),
                        SoPhong = reader.IsDBNull("SoPhong") ? null : reader.GetString("SoPhong"),
                        TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha"),
                        SoHoaDonChuaThanhToan = reader.GetInt32("SoHoaDonChuaThanhToan"),
                        TongCongNo = reader.GetDecimal("TongCongNo")
                    });
                }

                return Ok(new { success = true, data = report });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("electricity-water")]
        public async Task<IActionResult> GetElectricityWaterReport([FromQuery] int thang, [FromQuery] int nam)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_BaoCaoDienNuoc", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@Thang", thang);
                command.Parameters.AddWithValue("@Nam", nam);

                using var reader = await command.ExecuteReaderAsync();
                var report = new List<object>();

                while (await reader.ReadAsync())
                {
                    report.Add(new
                    {
                        TenToaNha = reader.GetString("TenToaNha"),
                        TongSoPhong = reader.GetInt32("TongSoPhong"),
                        TongSoDien = reader.IsDBNull("TongSoDien") ? (int?)null : Convert.ToInt32(reader["TongSoDien"]),
                        TongSoNuoc = reader.IsDBNull("TongSoNuoc") ? (int?)null : Convert.ToInt32(reader["TongSoNuoc"]),
                        TrungBinhDien = reader.IsDBNull("TrungBinhDien") ? (decimal?)null : Convert.ToDecimal(reader["TrungBinhDien"]),
                        TrungBinhNuoc = reader.IsDBNull("TrungBinhNuoc") ? (decimal?)null : Convert.ToDecimal(reader["TrungBinhNuoc"])
                    });
                }

                return Ok(new { success = true, data = report });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("violations")]
        public async Task<IActionResult> GetViolationsReport([FromQuery] int thang, [FromQuery] int nam)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_BaoCaoKyLuat", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@Thang", thang);
                command.Parameters.AddWithValue("@Nam", nam);

                using var reader = await command.ExecuteReaderAsync();
                var report = new List<object>();

                while (await reader.ReadAsync())
                {
                    report.Add(new
                    {
                        MSSV = reader.GetString("MSSV"),
                        HoTen = reader.GetString("HoTen"),
                        SoPhong = reader.IsDBNull("SoPhong") ? null : reader.GetString("SoPhong"),
                        TenToaNha = reader.IsDBNull("TenToaNha") ? null : reader.GetString("TenToaNha"),
                        LoaiViPham = reader.GetString("LoaiViPham"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        NgayViPham = reader.GetDateTime("NgayViPham"),
                        MucPhat = reader.GetDecimal("MucPhat"),
                        TrangThai = reader.GetString("TrangThai")
                    });
                }

                return Ok(new { success = true, data = report });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost("generate-monthly-bills")]
        public async Task<IActionResult> GenerateMonthlyBills([FromQuery] int thang, [FromQuery] int nam)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_TaoHoaDonHangThang", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@Thang", thang);
                command.Parameters.AddWithValue("@Nam", nam);
                command.Parameters.AddWithValue("@NguoiTao", User.Identity?.Name ?? "System");

                using var reader = await command.ExecuteReaderAsync();
                var result = new List<object>();

                while (await reader.ReadAsync())
                {
                    result.Add(new
                    {
                        SoLuongHoaDon = reader.GetInt32("SoLuongHoaDon")
                    });
                }

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost("calculate-electricity")]
        public async Task<IActionResult> CalculateElectricity([FromQuery] int soKwh, [FromQuery] int thang, [FromQuery] int nam)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_TinhTienDien", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@SoKwh", soKwh);
                command.Parameters.AddWithValue("@Thang", thang);
                command.Parameters.AddWithValue("@Nam", nam);

                using var reader = await command.ExecuteReaderAsync();
                var result = new List<object>();

                while (await reader.ReadAsync())
                {
                    result.Add(new
                    {
                        TongTienDien = reader.GetDecimal("TongTienDien")
                    });
                }

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost("calculate-water")]
        public async Task<IActionResult> CalculateWater([FromQuery] int soKhoi, [FromQuery] int thang, [FromQuery] int nam)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_TinhTienNuoc", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@SoKhoi", soKhoi);
                command.Parameters.AddWithValue("@Thang", thang);
                command.Parameters.AddWithValue("@Nam", nam);

                using var reader = await command.ExecuteReaderAsync();
                var result = new List<object>();

                while (await reader.ReadAsync())
                {
                    result.Add(new
                    {
                        TongTienNuoc = reader.GetDecimal("TongTienNuoc")
                    });
                }

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}












