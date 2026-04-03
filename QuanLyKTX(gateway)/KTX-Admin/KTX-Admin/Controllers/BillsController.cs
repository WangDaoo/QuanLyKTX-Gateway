using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/bills")]
    [Authorize(Roles = "Admin,Officer")]
    public class BillsController : ControllerBase
    {
        private readonly string _connectionString;

        public BillsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("KTX") ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? maSinhVien = null, [FromQuery] int? thang = null, [FromQuery] int? nam = null, [FromQuery] string? trangThai = null)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_HoaDon_GetAll", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                using var reader = await command.ExecuteReaderAsync();
                var allBills = new List<HoaDon>();
                while (await reader.ReadAsync())
                {
                    allBills.Add(new HoaDon
                    {
                        MaHoaDon = reader.GetInt32("MaHoaDon"),
                        MaSinhVien = reader.IsDBNull("MaSinhVien") ? null : reader.GetInt32("MaSinhVien"),
                        MaPhong = reader.IsDBNull("MaPhong") ? null : reader.GetInt32("MaPhong"),
                        MaHopDong = reader.IsDBNull("MaHopDong") ? null : reader.GetInt32("MaHopDong"),
                        Thang = reader.GetInt32("Thang"),
                        Nam = reader.GetInt32("Nam"),
                        TongTien = reader.GetDecimal("TongTien"),
                        TrangThai = reader.GetString("TrangThai"),
                        HanThanhToan = reader.IsDBNull("HanThanhToan") ? (DateTime?)null : reader.GetDateTime("HanThanhToan"),
                        NgayThanhToan = reader.IsDBNull("NgayThanhToan") ? (DateTime?)null : reader.GetDateTime("NgayThanhToan"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                // Lọc kết quả theo query parameters
                var bills = allBills.AsQueryable();
                if (maSinhVien.HasValue)
                    bills = bills.Where(b => b.MaSinhVien == maSinhVien.Value);
                if (thang.HasValue)
                    bills = bills.Where(b => b.Thang == thang.Value);
                if (nam.HasValue)
                    bills = bills.Where(b => b.Nam == nam.Value);
                if (!string.IsNullOrEmpty(trangThai))
                    bills = bills.Where(b => b.TrangThai == trangThai);

                return Ok(new { success = true, data = bills.ToList() });
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

                using var command = new SqlCommand("sp_HoaDon_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaHoaDon", id);

                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var bill = new HoaDon
                    {
                        MaHoaDon = reader.GetInt32("MaHoaDon"),
                        MaSinhVien = reader.IsDBNull("MaSinhVien") ? null : reader.GetInt32("MaSinhVien"),
                        MaPhong = reader.IsDBNull("MaPhong") ? null : reader.GetInt32("MaPhong"),
                        MaHopDong = reader.IsDBNull("MaHopDong") ? null : reader.GetInt32("MaHopDong"),
                        Thang = reader.GetInt32("Thang"),
                        Nam = reader.GetInt32("Nam"),
                        TongTien = reader.GetDecimal("TongTien"),
                        TrangThai = reader.GetString("TrangThai"),
                        HanThanhToan = reader.IsDBNull("HanThanhToan") ? (DateTime?)null : reader.GetDateTime("HanThanhToan"),
                        NgayThanhToan = reader.IsDBNull("NgayThanhToan") ? (DateTime?)null : reader.GetDateTime("NgayThanhToan"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = bill });
                }

                return NotFound(new { success = false, message = "Không tìm thấy hóa đơn" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] HoaDon model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_HoaDon_Insert", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaSinhVien", (object?)model.MaSinhVien ?? DBNull.Value);
                command.Parameters.AddWithValue("@MaPhong", (object?)model.MaPhong ?? DBNull.Value);
                command.Parameters.AddWithValue("@MaHopDong", (object?)model.MaHopDong ?? DBNull.Value);
                command.Parameters.AddWithValue("@Thang", model.Thang);
                command.Parameters.AddWithValue("@Nam", model.Nam);
                command.Parameters.AddWithValue("@TongTien", model.TongTien);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@HanThanhToan", (object?)model.HanThanhToan ?? DBNull.Value);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);

                var newId = await command.ExecuteScalarAsync();
                model.MaHoaDon = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;

                return CreatedAtAction(nameof(GetAll), new { }, new { success = true, data = model });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] HoaDon model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                // Lấy giá trị hiện tại nếu không có trong body
                int? maSV = model.MaSinhVien;
                int? maPhong = model.MaPhong;
                int? maHD = model.MaHopDong;
                int thang = model.Thang;
                int nam = model.Nam;
                if (!maSV.HasValue || thang == 0 || nam == 0)
                {
                    using var getCmd = new SqlCommand("sp_HoaDon_GetById", connection) { CommandType = CommandType.StoredProcedure };
                    getCmd.Parameters.AddWithValue("@MaHoaDon", id);
                    using var rdr = await getCmd.ExecuteReaderAsync();
                    if (await rdr.ReadAsync())
                    {
                        if (!maSV.HasValue) maSV = rdr.IsDBNull(rdr.GetOrdinal("MaSinhVien")) ? (int?)null : rdr.GetInt32(rdr.GetOrdinal("MaSinhVien"));
                        if (!maPhong.HasValue) maPhong = rdr.IsDBNull(rdr.GetOrdinal("MaPhong")) ? (int?)null : rdr.GetInt32(rdr.GetOrdinal("MaPhong"));
                        if (!maHD.HasValue) maHD = rdr.IsDBNull(rdr.GetOrdinal("MaHopDong")) ? (int?)null : rdr.GetInt32(rdr.GetOrdinal("MaHopDong"));
                        if (thang == 0) thang = rdr.GetInt32(rdr.GetOrdinal("Thang"));
                        if (nam == 0) nam = rdr.GetInt32(rdr.GetOrdinal("Nam"));
                    }
                    rdr.Close();
                }

                using var command = new SqlCommand("sp_HoaDon_Update", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaHoaDon", id);
                command.Parameters.AddWithValue("@MaSinhVien", (object?)maSV ?? DBNull.Value);
                command.Parameters.AddWithValue("@MaPhong", (object?)maPhong ?? DBNull.Value);
                command.Parameters.AddWithValue("@MaHopDong", (object?)maHD ?? DBNull.Value);
                command.Parameters.AddWithValue("@Thang", thang);
                command.Parameters.AddWithValue("@Nam", nam);
                command.Parameters.AddWithValue("@TongTien", model.TongTien);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@HanThanhToan", (object?)model.HanThanhToan ?? DBNull.Value);
                command.Parameters.AddWithValue("@NgayThanhToan", (object?)model.NgayThanhToan ?? DBNull.Value);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy hóa đơn" });

                // Fetch lại bill sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_HoaDon_GetById", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                getCommand.Parameters.AddWithValue("@MaHoaDon", id);

                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedBill = new HoaDon
                    {
                        MaHoaDon = reader.GetInt32("MaHoaDon"),
                        MaSinhVien = reader.IsDBNull("MaSinhVien") ? null : reader.GetInt32("MaSinhVien"),
                        MaPhong = reader.IsDBNull("MaPhong") ? null : reader.GetInt32("MaPhong"),
                        MaHopDong = reader.IsDBNull("MaHopDong") ? null : reader.GetInt32("MaHopDong"),
                        Thang = reader.GetInt32("Thang"),
                        Nam = reader.GetInt32("Nam"),
                        TongTien = reader.GetDecimal("TongTien"),
                        TrangThai = reader.GetString("TrangThai"),
                        HanThanhToan = reader.IsDBNull("HanThanhToan") ? (DateTime?)null : reader.GetDateTime("HanThanhToan"),
                        NgayThanhToan = reader.IsDBNull("NgayThanhToan") ? (DateTime?)null : reader.GetDateTime("NgayThanhToan"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = updatedBill, message = "Cập nhật hóa đơn thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật hóa đơn thành công" });
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

                using var command = new SqlCommand("sp_HoaDon_Delete", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaHoaDon", id);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy hóa đơn" });

                return Ok(new { success = true, message = "Xóa hóa đơn thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost("calculate-monthly")]
        public async Task<IActionResult> CalculateMonthly([FromQuery] int thang, [FromQuery] int nam)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_HoaDon_GenerateMonthly", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@Thang", thang);
                command.Parameters.AddWithValue("@Nam", nam);
                command.Parameters.AddWithValue("@NguoiTao", User.FindFirst("MaTaiKhoan")?.Value ?? "System");

                // ⚠️ FIX: SP trả về NVARCHAR (message) + result set — dùng ExecuteReader để lấy SoLuongHoaDon
                using var reader = await command.ExecuteReaderAsync();
                var generated = 0;
                while (await reader.ReadAsync())
                {
                    generated = reader.GetInt32(0); // Đọc cột đầu tiên (SoLuongHoaDon)
                }
                await reader.CloseAsync();

                string message = generated > 0
                    ? $"Đã tạo {generated} hóa đơn cho tháng {thang}/{nam}"
                    : $"Không có hóa đơn nào được tạo. Có thể do: (1) Không có sinh viên nào có hợp đồng đã được xác nhận, hoặc (2) Tất cả sinh viên đã có hóa đơn cho tháng {thang}/{nam}";

                return Ok(new { success = true, data = new { generated }, message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        // Chi tiết hóa đơn endpoints
        [HttpGet("{id:int}/details")]
        public async Task<IActionResult> GetBillDetails(int id)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_ChiTietHoaDon_GetByHoaDon", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaHoaDon", id);

                using var reader = await command.ExecuteReaderAsync();
                var details = new List<ChiTietHoaDon>();

                while (await reader.ReadAsync())
                {
                    details.Add(new ChiTietHoaDon
                    {
                        MaChiTiet = reader.GetInt32("MaChiTiet"),
                        MaHoaDon = reader.GetInt32("MaHoaDon"),
                        LoaiChiPhi = reader.GetString("LoaiChiPhi"),
                        SoLuong = reader.GetInt32("SoLuong"),
                        DonGia = reader.GetDecimal("DonGia"),
                        ThanhTien = reader.GetDecimal("ThanhTien"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = details });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost("{id:int}/details")]
        public async Task<IActionResult> CreateBillDetail(int id, [FromBody] ChiTietHoaDon model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_ChiTietHoaDon_Create", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaHoaDon", id);
                command.Parameters.AddWithValue("@LoaiChiPhi", model.LoaiChiPhi);
                command.Parameters.AddWithValue("@SoLuong", model.SoLuong);
                command.Parameters.AddWithValue("@DonGia", model.DonGia);
                command.Parameters.AddWithValue("@ThanhTien", model.ThanhTien);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);

                var newId = await command.ExecuteScalarAsync();
                model.MaChiTiet = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;
                model.MaHoaDon = id;

                return CreatedAtAction(nameof(GetBillDetails), new { id }, new { success = true, data = model });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}/details/{detailId:int}")]
        public async Task<IActionResult> UpdateBillDetail(int id, int detailId, [FromBody] ChiTietHoaDon model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_ChiTietHoaDon_Update", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaChiTiet", detailId);
                command.Parameters.AddWithValue("@MaHoaDon", id);  // BUG FIX: missing @MaHoaDon parameter
                command.Parameters.AddWithValue("@LoaiChiPhi", model.LoaiChiPhi);
                command.Parameters.AddWithValue("@SoLuong", model.SoLuong);
                command.Parameters.AddWithValue("@DonGia", model.DonGia);
                command.Parameters.AddWithValue("@ThanhTien", model.ThanhTien);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy chi tiết hóa đơn" });

                return Ok(new { success = true, message = "Cập nhật chi tiết hóa đơn thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpDelete("{id:int}/details/{detailId:int}")]
        public async Task<IActionResult> DeleteBillDetail(int id, int detailId)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_ChiTietHoaDon_Delete", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@MaChiTiet", detailId);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                    return NotFound(new { success = false, message = "Không tìm thấy chi tiết hóa đơn" });

                return Ok(new { success = true, message = "Xóa chi tiết hóa đơn thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}
