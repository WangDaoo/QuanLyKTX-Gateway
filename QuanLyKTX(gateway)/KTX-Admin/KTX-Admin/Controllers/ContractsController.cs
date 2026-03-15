using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
    [ApiController]
    [Route("api/contracts")]
    [Authorize(Roles = "Admin,Officer")]
    public class ContractsController : ControllerBase
    {
        private readonly string _connectionString;

        public ContractsController(IConfiguration configuration)
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
                using var command = new SqlCommand("sp_HopDong_GetAll", connection) { CommandType = CommandType.StoredProcedure };
                using var reader = await command.ExecuteReaderAsync();
                var items = new List<HopDong>();
                while (await reader.ReadAsync())
                {
                    items.Add(new HopDong
                    {
                        MaHopDong = reader.GetInt32("MaHopDong"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        MaGiuong = reader.GetInt32("MaGiuong"),
                        NgayBatDau = reader.GetDateTime("NgayBatDau"),
                        NgayKetThuc = reader.GetDateTime("NgayKetThuc"),
                        GiaPhong = reader.GetDecimal("GiaPhong"),
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
                using var command = new SqlCommand("sp_HopDong_GetById", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaHopDong", id);
                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var item = new HopDong
                    {
                        MaHopDong = reader.GetInt32("MaHopDong"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        MaGiuong = reader.GetInt32("MaGiuong"),
                        NgayBatDau = reader.GetDateTime("NgayBatDau"),
                        NgayKetThuc = reader.GetDateTime("NgayKetThuc"),
                        GiaPhong = reader.GetDecimal("GiaPhong"),
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
                return NotFound(new { success = false, message = "Không tìm thấy hợp đồng" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] HopDong model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_HopDong_Insert", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
                command.Parameters.AddWithValue("@MaGiuong", model.MaGiuong);
                command.Parameters.AddWithValue("@NgayBatDau", model.NgayBatDau);
                command.Parameters.AddWithValue("@NgayKetThuc", model.NgayKetThuc);
                command.Parameters.AddWithValue("@GiaPhong", model.GiaPhong);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiTao", (object?)model.NguoiTao ?? DBNull.Value);
                var newId = await command.ExecuteScalarAsync();
                model.MaHopDong = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;
                return CreatedAtAction(nameof(GetById), new { id = model.MaHopDong }, new { success = true, data = model });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] HopDong model)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_HopDong_Update", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaHopDong", id);
                command.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
                command.Parameters.AddWithValue("@MaGiuong", model.MaGiuong);
                command.Parameters.AddWithValue("@NgayBatDau", model.NgayBatDau);
                command.Parameters.AddWithValue("@NgayKetThuc", model.NgayKetThuc);
                command.Parameters.AddWithValue("@GiaPhong", model.GiaPhong);
                command.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
                command.Parameters.AddWithValue("@NguoiCapNhat", (object?)model.NguoiCapNhat ?? DBNull.Value);
                var rows = await command.ExecuteNonQueryAsync();
                if (rows == 0) return NotFound(new { success = false, message = "Không tìm thấy hợp đồng" });

                // Fetch lại contract sau khi update để trả về data
                using var getCommand = new SqlCommand("sp_HopDong_GetById", connection) { CommandType = CommandType.StoredProcedure };
                getCommand.Parameters.AddWithValue("@MaHopDong", id);
                using var reader = await getCommand.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var updatedContract = new HopDong
                    {
                        MaHopDong = reader.GetInt32("MaHopDong"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        MaGiuong = reader.GetInt32("MaGiuong"),
                        NgayBatDau = reader.GetDateTime("NgayBatDau"),
                        NgayKetThuc = reader.GetDateTime("NgayKetThuc"),
                        GiaPhong = reader.GetDecimal("GiaPhong"),
                        TrangThai = reader.GetString("TrangThai"),
                        GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = updatedContract, message = "Cập nhật hợp đồng thành công" });
                }
                return Ok(new { success = true, data = model, message = "Cập nhật hợp đồng thành công" });
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
                using var command = new SqlCommand("sp_HopDong_Delete", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaHopDong", id);
                var rows = await command.ExecuteNonQueryAsync();
                if (rows == 0) return NotFound(new { success = false, message = "Không tìm thấy hợp đồng" });
                return Ok(new { success = true, message = "Xóa hợp đồng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("student/{studentId:int}/current")]
        public async Task<IActionResult> GetCurrentByStudent(int studentId)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var command = new SqlCommand("sp_HopDong_GetCurrentBySinhVien", connection) { CommandType = CommandType.StoredProcedure };
                command.Parameters.AddWithValue("@MaSinhVien", studentId);
                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var item = new HopDong
                    {
                        MaHopDong = reader.GetInt32("MaHopDong"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        MaGiuong = reader.GetInt32("MaGiuong"),
                        NgayBatDau = reader.GetDateTime("NgayBatDau"),
                        NgayKetThuc = reader.GetDateTime("NgayKetThuc"),
                        GiaPhong = reader.GetDecimal("GiaPhong"),
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
                return NotFound(new { success = false, message = "Không tìm thấy hợp đồng hiện tại của sinh viên" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpPost("{id:int}/extend")]
        public async Task<IActionResult> Extend(int id, [FromBody] ExtendContractRequest request)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                // Lấy thông tin hợp đồng hiện tại
                using var getCommand = new SqlCommand("sp_HopDong_GetById", connection) { CommandType = CommandType.StoredProcedure };
                getCommand.Parameters.AddWithValue("@MaHopDong", id);
                using var reader = await getCommand.ExecuteReaderAsync();
                
                if (!await reader.ReadAsync())
                    return NotFound(new { success = false, message = "Không tìm thấy hợp đồng" });

                var ngayKetThucCu = reader.GetDateTime("NgayKetThuc");
                var model = new HopDong
                {
                    MaSinhVien = reader.GetInt32("MaSinhVien"),
                    MaGiuong = reader.GetInt32("MaGiuong"),
                    NgayBatDau = reader.GetDateTime("NgayBatDau"),
                    NgayKetThuc = ngayKetThucCu.AddMonths(request.SoThangGiaHan),
                    GiaPhong = reader.GetDecimal("GiaPhong"),
                    TrangThai = reader.GetString("TrangThai"),
                    GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu")
                };
                reader.Close();

                // Cập nhật hợp đồng với ngày kết thúc mới
                using var updateCommand = new SqlCommand("sp_HopDong_Update", connection) { CommandType = CommandType.StoredProcedure };
                updateCommand.Parameters.AddWithValue("@MaHopDong", id);
                updateCommand.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
                updateCommand.Parameters.AddWithValue("@MaGiuong", model.MaGiuong);
                updateCommand.Parameters.AddWithValue("@NgayBatDau", model.NgayBatDau);
                updateCommand.Parameters.AddWithValue("@NgayKetThuc", model.NgayKetThuc);
                updateCommand.Parameters.AddWithValue("@GiaPhong", model.GiaPhong);
                updateCommand.Parameters.AddWithValue("@TrangThai", model.TrangThai);
                updateCommand.Parameters.AddWithValue("@GhiChu", (object?)(model.GhiChu + $" | Gia hạn thêm {request.SoThangGiaHan} tháng") ?? DBNull.Value);
                updateCommand.Parameters.AddWithValue("@NguoiCapNhat", (object?)User.FindFirst("MaTaiKhoan")?.Value ?? DBNull.Value);

                var rows = await updateCommand.ExecuteNonQueryAsync();
                if (rows == 0) return NotFound(new { success = false, message = "Không thể gia hạn hợp đồng" });

                // Fetch lại hợp đồng sau khi gia hạn
                using var getAfterCommand = new SqlCommand("sp_HopDong_GetById", connection) { CommandType = CommandType.StoredProcedure };
                getAfterCommand.Parameters.AddWithValue("@MaHopDong", id);
                using var afterReader = await getAfterCommand.ExecuteReaderAsync();
                if (await afterReader.ReadAsync())
                {
                    var extendedContract = new HopDong
                    {
                        MaHopDong = afterReader.GetInt32("MaHopDong"),
                        MaSinhVien = afterReader.GetInt32("MaSinhVien"),
                        MaGiuong = afterReader.GetInt32("MaGiuong"),
                        NgayBatDau = afterReader.GetDateTime("NgayBatDau"),
                        NgayKetThuc = afterReader.GetDateTime("NgayKetThuc"),
                        GiaPhong = afterReader.GetDecimal("GiaPhong"),
                        TrangThai = afterReader.GetString("TrangThai"),
                        GhiChu = afterReader.IsDBNull("GhiChu") ? null : afterReader.GetString("GhiChu"),
                        IsDeleted = afterReader.GetBoolean("IsDeleted"),
                        NgayTao = afterReader.GetDateTime("NgayTao"),
                        NguoiTao = afterReader.IsDBNull("NguoiTao") ? null : afterReader.GetString("NguoiTao"),
                        NgayCapNhat = afterReader.IsDBNull("NgayCapNhat") ? (DateTime?)null : afterReader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = afterReader.IsDBNull("NguoiCapNhat") ? null : afterReader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = extendedContract, message = $"Gia hạn hợp đồng thành công thêm {request.SoThangGiaHan} tháng" });
                }
                return Ok(new { success = true, message = $"Gia hạn hợp đồng thành công thêm {request.SoThangGiaHan} tháng" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }

    public class ExtendContractRequest
    {
        public int SoThangGiaHan { get; set; }
    }
}


