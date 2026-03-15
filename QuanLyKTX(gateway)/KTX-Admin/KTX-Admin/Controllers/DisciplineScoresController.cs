using Microsoft.AspNetCore.Mvc;
using KTX_Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Controllers
{
	[ApiController]
	[Route("api/discipline-scores")]
	[Authorize(Roles = "Admin,Officer")]
	public class DisciplineScoresController : ControllerBase
	{
		private readonly string _connectionString;

		public DisciplineScoresController(IConfiguration configuration)
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

				using var command = new SqlCommand("sp_DiemRenLuyen_GetAll", connection)
				{
					CommandType = CommandType.StoredProcedure
				};

				using var reader = await command.ExecuteReaderAsync();
				var scores = new List<DiemRenLuyen>();

				while (await reader.ReadAsync())
				{
					scores.Add(new DiemRenLuyen
					{
						MaDiem = reader.GetInt32("MaDiem"),
						MaSinhVien = reader.GetInt32("MaSinhVien"),
						Thang = reader.GetInt32("Thang"),
						Nam = reader.GetInt32("Nam"),
						DiemSo = reader.GetDecimal("DiemSo"),
						XepLoai = reader.GetString("XepLoai"),
						GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
						IsDeleted = reader.GetBoolean("IsDeleted"),
						NgayTao = reader.GetDateTime("NgayTao"),
						NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
						NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
						NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
					});
				}

				return Ok(new { success = true, data = scores });
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

				using var command = new SqlCommand("sp_DiemRenLuyen_GetById", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				command.Parameters.AddWithValue("@MaDiem", id);

				using var reader = await command.ExecuteReaderAsync();
				if (await reader.ReadAsync())
				{
					var score = new DiemRenLuyen
					{
						MaDiem = reader.GetInt32("MaDiem"),
						MaSinhVien = reader.GetInt32("MaSinhVien"),
						Thang = reader.GetInt32("Thang"),
						Nam = reader.GetInt32("Nam"),
						DiemSo = reader.GetDecimal("DiemSo"),
						XepLoai = reader.GetString("XepLoai"),
						GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
						IsDeleted = reader.GetBoolean("IsDeleted"),
						NgayTao = reader.GetDateTime("NgayTao"),
						NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
						NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
						NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
					};
					return Ok(new { success = true, data = score });
				}
				return NotFound(new { success = false, message = "Không tìm thấy điểm rèn luyện" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
			}
		}

		[HttpGet("by-student/{studentId:int}")]
		public async Task<IActionResult> GetByStudent(int studentId)
		{
			try
			{
				using var connection = new SqlConnection(_connectionString);
				await connection.OpenAsync();

				using var command = new SqlCommand("sp_DiemRenLuyen_GetBySinhVien", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				command.Parameters.AddWithValue("@MaSinhVien", studentId);

				using var reader = await command.ExecuteReaderAsync();
				var scores = new List<DiemRenLuyen>();

				while (await reader.ReadAsync())
				{
					scores.Add(new DiemRenLuyen
					{
						MaDiem = reader.GetInt32("MaDiem"),
						MaSinhVien = reader.GetInt32("MaSinhVien"),
						Thang = reader.GetInt32("Thang"),
						Nam = reader.GetInt32("Nam"),
						DiemSo = reader.GetDecimal("DiemSo"),
						XepLoai = reader.GetString("XepLoai"),
						GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
						IsDeleted = reader.GetBoolean("IsDeleted"),
						NgayTao = reader.GetDateTime("NgayTao"),
						NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
						NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
						NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
					});
				}

				return Ok(new { success = true, data = scores });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
			}
		}

		[HttpPost]
		public async Task<IActionResult> Create([FromBody] DiemRenLuyen model)
		{
			try
			{
				using var connection = new SqlConnection(_connectionString);
				await connection.OpenAsync();

				using var command = new SqlCommand("sp_DiemRenLuyen_Insert", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				command.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
				command.Parameters.AddWithValue("@Thang", model.Thang);
				command.Parameters.AddWithValue("@Nam", model.Nam);
				command.Parameters.AddWithValue("@DiemSo", model.DiemSo);
				command.Parameters.AddWithValue("@XepLoai", model.XepLoai ?? "Không xếp loại");
				command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
				command.Parameters.AddWithValue("@NguoiTao", (object?)model.NguoiTao ?? DBNull.Value);

				var newId = await command.ExecuteScalarAsync();
				model.MaDiem = newId != null && newId != DBNull.Value ? Convert.ToInt32(newId) : 0;

				return CreatedAtAction(nameof(GetById), new { id = model.MaDiem }, new { success = true, data = model });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
			}
		}

		[HttpPut("{id:int}")]
		public async Task<IActionResult> Update(int id, [FromBody] DiemRenLuyen model)
		{
			try
			{
				using var connection = new SqlConnection(_connectionString);
				await connection.OpenAsync();

				using var command = new SqlCommand("sp_DiemRenLuyen_Update", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				command.Parameters.AddWithValue("@MaDiem", id);
				command.Parameters.AddWithValue("@MaSinhVien", model.MaSinhVien);
				command.Parameters.AddWithValue("@Thang", model.Thang);
				command.Parameters.AddWithValue("@Nam", model.Nam);
				command.Parameters.AddWithValue("@DiemSo", model.DiemSo);
				command.Parameters.AddWithValue("@XepLoai", model.XepLoai ?? "Không xếp loại");
				command.Parameters.AddWithValue("@GhiChu", (object?)model.GhiChu ?? DBNull.Value);
				command.Parameters.AddWithValue("@NguoiCapNhat", (object?)model.NguoiCapNhat ?? DBNull.Value);

				var rowsAffected = await command.ExecuteNonQueryAsync();
				if (rowsAffected == 0)
					return NotFound(new { success = false, message = "Không tìm thấy điểm rèn luyện" });

				// Fetch lại score sau khi update để trả về data
				using var getCommand = new SqlCommand("sp_DiemRenLuyen_GetById", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				getCommand.Parameters.AddWithValue("@MaDiem", id);

				using var reader = await getCommand.ExecuteReaderAsync();
				if (await reader.ReadAsync())
				{
					var updatedScore = new DiemRenLuyen
					{
						MaDiem = reader.GetInt32("MaDiem"),
						MaSinhVien = reader.GetInt32("MaSinhVien"),
						Thang = reader.GetInt32("Thang"),
						Nam = reader.GetInt32("Nam"),
						DiemSo = reader.GetDecimal("DiemSo"),
						XepLoai = reader.GetString("XepLoai"),
						GhiChu = reader.IsDBNull("GhiChu") ? null : reader.GetString("GhiChu"),
						IsDeleted = reader.GetBoolean("IsDeleted"),
						NgayTao = reader.GetDateTime("NgayTao"),
						NguoiTao = reader.IsDBNull("NguoiTao") ? null : reader.GetString("NguoiTao"),
						NgayCapNhat = reader.IsDBNull("NgayCapNhat") ? (DateTime?)null : reader.GetDateTime("NgayCapNhat"),
						NguoiCapNhat = reader.IsDBNull("NguoiCapNhat") ? null : reader.GetString("NguoiCapNhat")
					};
					return Ok(new { success = true, data = updatedScore, message = "Cập nhật điểm rèn luyện thành công" });
				}
				return Ok(new { success = true, data = model, message = "Cập nhật điểm rèn luyện thành công" });
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

				using var command = new SqlCommand("sp_DiemRenLuyen_Delete", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				command.Parameters.AddWithValue("@MaDiem", id);

				var rowsAffected = await command.ExecuteNonQueryAsync();
				if (rowsAffected == 0)
					return NotFound(new { success = false, message = "Không tìm thấy điểm rèn luyện" });

				return Ok(new { success = true, message = "Xóa điểm rèn luyện thành công" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { success = false, message = $"Lỗi server: {ex.Message}" });
			}
		}
	}
}
