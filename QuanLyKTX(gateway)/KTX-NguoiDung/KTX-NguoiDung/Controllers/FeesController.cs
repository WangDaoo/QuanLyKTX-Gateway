using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;
using KTX_NguoiDung.Models;

namespace KTX_NguoiDung.Controllers
{
    [ApiController]
    [Route("api/fees")]
    [Authorize(Roles = "Student")]
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

                using var command = new SqlCommand("sp_MucPhi_GetAll", connection);
                command.CommandType = CommandType.StoredProcedure;

                using var reader = await command.ExecuteReaderAsync();
                var fees = new List<object>();
                
                while (await reader.ReadAsync())
                {
                    fees.Add(new
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

                using var command = new SqlCommand("sp_MucPhi_GetById", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@MaMucPhi", id);

                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    var fee = new
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

        [HttpGet("by-type/{loaiPhi}")]
        public async Task<IActionResult> GetByType(string loaiPhi)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("sp_MucPhi_GetByType", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@LoaiPhi", loaiPhi);

                using var reader = await command.ExecuteReaderAsync();
                var fees = new List<object>();
                
                while (await reader.ReadAsync())
                {
                    fees.Add(new
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
