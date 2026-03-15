using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
	[ApiController]
	[Route("api/price-tiers")]
	[Authorize(Roles = "Admin,Officer")]
	public class PriceTiersController : ControllerBase
	{
		private readonly string _connectionString;

		public PriceTiersController(IConfiguration configuration)
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

				using var command = new SqlCommand("sp_BacGia_GetAll", connection)
				{
					CommandType = CommandType.StoredProcedure
				};

				using var reader = await command.ExecuteReaderAsync();
				var priceTiers = new List<BacGia>();

				while (await reader.ReadAsync())
				{
					priceTiers.Add(new BacGia
					{
						MaBac = reader.GetInt32("MaBac"),
						Loai = reader.GetString("Loai"),
						ThuTu = reader.GetInt32("ThuTu"),
						TuSo = reader.IsDBNull("TuSo") ? null : reader.GetInt32("TuSo"),
						DenSo = reader.IsDBNull("DenSo") ? null : reader.GetInt32("DenSo"),
						DonGia = reader.GetDecimal("DonGia"),
                        TrangThai = reader.GetBoolean("TrangThai")
					});
				}

				return Ok(new { success = true, data = priceTiers });
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

				using var command = new SqlCommand("sp_BacGia_GetById", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				command.Parameters.AddWithValue("@MaBac", id);

				using var reader = await command.ExecuteReaderAsync();
				if (await reader.ReadAsync())
				{
					var priceTier = new BacGia
					{
						MaBac = reader.GetInt32("MaBac"),
						Loai = reader.GetString("Loai"),
						ThuTu = reader.GetInt32("ThuTu"),
						TuSo = reader.IsDBNull("TuSo") ? null : reader.GetInt32("TuSo"),
						DenSo = reader.IsDBNull("DenSo") ? null : reader.GetInt32("DenSo"),
						DonGia = reader.GetDecimal("DonGia"),
                        TrangThai = reader.GetBoolean("TrangThai")
					};
					return Ok(new { success = true, data = priceTier });
				}
				return NotFound(new { success = false, message = "Không tìm thấy bậc giá" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
			}
		}

		[HttpPost]
		public async Task<IActionResult> Create([FromBody] BacGia model)
		{
			try
			{
				using var connection = new SqlConnection(_connectionString);
				await connection.OpenAsync();

				using var command = new SqlCommand("sp_BacGia_Insert", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				command.Parameters.AddWithValue("@Loai", model.Loai);
				command.Parameters.AddWithValue("@ThuTu", model.ThuTu);
				command.Parameters.AddWithValue("@TuSo", (object?)model.TuSo ?? DBNull.Value);
				command.Parameters.AddWithValue("@DenSo", (object?)model.DenSo ?? DBNull.Value);
				command.Parameters.AddWithValue("@DonGia", model.DonGia);
				command.Parameters.AddWithValue("@TrangThai", model.TrangThai);

				var newId = await command.ExecuteScalarAsync();
				model.MaBac = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;

				return CreatedAtAction(nameof(GetById), new { id = model.MaBac }, new { success = true, data = model });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
			}
		}

		[HttpPut("{id:int}")]
		public async Task<IActionResult> Update(int id, [FromBody] BacGia model)
		{
			try
			{
				using var connection = new SqlConnection(_connectionString);
				await connection.OpenAsync();

				using var command = new SqlCommand("sp_BacGia_Update", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				command.Parameters.AddWithValue("@MaBac", id);
				command.Parameters.AddWithValue("@Loai", model.Loai);
				command.Parameters.AddWithValue("@ThuTu", model.ThuTu);
				command.Parameters.AddWithValue("@TuSo", (object?)model.TuSo ?? DBNull.Value);
				command.Parameters.AddWithValue("@DenSo", (object?)model.DenSo ?? DBNull.Value);
				command.Parameters.AddWithValue("@DonGia", model.DonGia);
				command.Parameters.AddWithValue("@TrangThai", model.TrangThai);

				var rowsAffected = await command.ExecuteNonQueryAsync();
				if (rowsAffected == 0)
					return NotFound(new { success = false, message = "Không tìm thấy bậc giá" });

				// Fetch lại price tier sau khi update để trả về data
				using var getCommand = new SqlCommand("sp_BacGia_GetById", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				getCommand.Parameters.AddWithValue("@MaBac", id);

				using var reader = await getCommand.ExecuteReaderAsync();
				if (await reader.ReadAsync())
				{
					var updatedPriceTier = new BacGia
					{
						MaBac = reader.GetInt32("MaBac"),
						Loai = reader.GetString("Loai"),
						ThuTu = reader.GetInt32("ThuTu"),
						TuSo = reader.IsDBNull("TuSo") ? null : reader.GetInt32("TuSo"),
						DenSo = reader.IsDBNull("DenSo") ? null : reader.GetInt32("DenSo"),
						DonGia = reader.GetDecimal("DonGia"),
						TrangThai = reader.GetBoolean("TrangThai"),
						IsDeleted = reader.GetBoolean("IsDeleted"),
						NgayTao = reader.GetDateTime("NgayTao"),
						NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
						NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
						NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
					};
					return Ok(new { success = true, data = updatedPriceTier, message = "Cập nhật bậc giá thành công" });
				}
				return Ok(new { success = true, data = model, message = "Cập nhật bậc giá thành công" });
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

				using var command = new SqlCommand("sp_BacGia_Delete", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				command.Parameters.AddWithValue("@MaBac", id);

				var rowsAffected = await command.ExecuteNonQueryAsync();
				if (rowsAffected == 0)
					return NotFound(new { success = false, message = "Không tìm thấy bậc giá" });

				return Ok(new { success = true, message = "Xóa bậc giá thành công" });
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

				using var command = new SqlCommand("sp_BacGia_GetByLoaiPhi", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				command.Parameters.AddWithValue("@Loai", loai);

				using var reader = await command.ExecuteReaderAsync();
				var priceTiers = new List<BacGia>();

				while (await reader.ReadAsync())
				{
					priceTiers.Add(new BacGia
					{
						MaBac = reader.GetInt32("MaBac"),
						Loai = reader.GetString("Loai"),
						ThuTu = reader.GetInt32("ThuTu"),
						TuSo = reader.IsDBNull("TuSo") ? null : reader.GetInt32("TuSo"),
						DenSo = reader.IsDBNull("DenSo") ? null : reader.GetInt32("DenSo"),
						DonGia = reader.GetDecimal("DonGia"),
						TrangThai = reader.GetBoolean("TrangThai"),
						IsDeleted = reader.GetBoolean("IsDeleted"),
						NgayTao = reader.GetDateTime("NgayTao"),
						NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
						NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
						NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
					});
				}

				return Ok(new { success = true, data = priceTiers });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
			}
		}
	}
}
