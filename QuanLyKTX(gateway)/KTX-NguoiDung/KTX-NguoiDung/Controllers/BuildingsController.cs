using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;
using KTX_NguoiDung.Models;

namespace KTX_NguoiDung.Controllers
{
    [ApiController]
    [Route("api/buildings")]
    [Authorize(Roles = "Student")]
    public class BuildingsController : ControllerBase
    {
        private readonly string _connectionString;

        public BuildingsController(IConfiguration configuration)
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

                using var command = new SqlCommand("sp_ToaNha_GetAll", connection);
                command.CommandType = CommandType.StoredProcedure;

                using var reader = await command.ExecuteReaderAsync();
                var buildings = new List<object>();
                
                while (await reader.ReadAsync())
                {
                    buildings.Add(new
                    {
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        TenToaNha = reader.GetString("TenToaNha"),
                        DiaChi = reader.IsDBNull("DiaChi") ? null : reader.GetString("DiaChi"),
                        SoTang = reader.IsDBNull("SoTang") ? (int?)null : reader.GetInt32("SoTang"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    });
                }

                return Ok(new { success = true, data = buildings });
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

                using var command = new SqlCommand("sp_ToaNha_GetById", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@MaToaNha", id);

                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    var building = new
                    {
                        MaToaNha = reader.GetInt32("MaToaNha"),
                        TenToaNha = reader.GetString("TenToaNha"),
                        DiaChi = reader.IsDBNull("DiaChi") ? null : reader.GetString("DiaChi"),
                        SoTang = reader.IsDBNull("SoTang") ? (int?)null : reader.GetInt32("SoTang"),
                        MoTa = reader.IsDBNull("MoTa") ? null : reader.GetString("MoTa"),
                        TrangThai = reader.GetBoolean("TrangThai"),
                        IsDeleted = reader.GetBoolean("IsDeleted"),
                        NgayTao = reader.GetDateTime("NgayTao"),
                        NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
                        NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
                        NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
                    };
                    return Ok(new { success = true, data = building });
                }

                return NotFound(new { success = false, message = "Không tìm thấy tòa nhà" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}
