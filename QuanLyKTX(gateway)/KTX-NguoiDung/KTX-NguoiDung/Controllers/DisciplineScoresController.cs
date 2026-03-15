using Microsoft.AspNetCore.Mvc;
using KTX_NguoiDung.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_NguoiDung.Controllers
{
	[ApiController]
	[Route("api/discipline-scores")]
	[Authorize(Roles = "Student")]
	public class DisciplineScoresController : ControllerBase
	{
		private readonly string _connectionString;

		public DisciplineScoresController(IConfiguration configuration)
		{
			_connectionString = configuration.GetConnectionString("KTX") ?? throw new ArgumentNullException(nameof(configuration));
		}

		[HttpGet("my-scores")]
		public async Task<IActionResult> GetMyScores()
		{
			try
			{
				var (maSinhVien, errorMessage) = GetCurrentStudentId();
				if (maSinhVien == null)
					return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin người dùng" });

				using var connection = new SqlConnection(_connectionString);
				await connection.OpenAsync();

				using var command = new SqlCommand("sp_DiemRenLuyen_GetBySinhVien", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				command.Parameters.AddWithValue("@MaSinhVien", maSinhVien);

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
						XepLoai = reader.IsDBNull("XepLoai") ? string.Empty : reader.GetString("XepLoai"),
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

		[HttpGet("my/{thang:int}/{nam:int}")]
		public async Task<IActionResult> GetMyScoreByMonth(int thang, int nam)
		{
			try
			{
				var (maSinhVien, errorMessage) = GetCurrentStudentId();
				if (maSinhVien == null)
					return Unauthorized(new { success = false, message = errorMessage ?? "Không tìm thấy thông tin người dùng" });

				using var connection = new SqlConnection(_connectionString);
				await connection.OpenAsync();

				using var command = new SqlCommand("sp_DiemRenLuyen_GetBySinhVienAndMonth", connection)
				{
					CommandType = CommandType.StoredProcedure
				};
				command.Parameters.AddWithValue("@MaSinhVien", maSinhVien);
				command.Parameters.AddWithValue("@Thang", thang);
				command.Parameters.AddWithValue("@Nam", nam);

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
						XepLoai = reader.IsDBNull("XepLoai") ? string.Empty : reader.GetString("XepLoai"),
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

		private (int? studentId, string? errorMessage) GetCurrentStudentId()
		{
			var userId = User.FindFirst("MaTaiKhoan")?.Value;
			if (string.IsNullOrEmpty(userId))
				return (null, "Token không hợp lệ hoặc không có thông tin người dùng");

			try
			{
				using var connection = new SqlConnection(_connectionString);
				connection.Open();

				// Lấy MaSinhVien từ TaiKhoan (nghiệp vụ: tài khoản Student PHẢI có MaSinhVien)
				using var command = new SqlCommand("SELECT MaSinhVien, VaiTro FROM TaiKhoan WHERE MaTaiKhoan = @MaTaiKhoan AND IsDeleted = 0", connection);
				command.Parameters.AddWithValue("@MaTaiKhoan", Convert.ToInt32(userId));

				using var reader = command.ExecuteReader();
				if (!reader.Read())
					return (null, "Tài khoản không tồn tại hoặc đã bị xóa");
				
				var vaiTro = reader.IsDBNull("VaiTro") ? null : reader.GetString("VaiTro");
				if (vaiTro != "Student")
					return (null, "Tài khoản không phải là sinh viên");
				
				var maSinhVien = reader.IsDBNull("MaSinhVien") ? (int?)null : reader.GetInt32("MaSinhVien");
				
				if (maSinhVien == null)
					return (null, "Tài khoản sinh viên chưa được liên kết với thông tin sinh viên"); // Nghiệp vụ: Student phải có MaSinhVien
				
				reader.Close();
				
				// Validate SinhVien tồn tại và không bị xóa (nghiệp vụ: đảm bảo tính hợp lệ)
				using var validateCommand = new SqlCommand("SELECT 1 FROM SinhVien WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0", connection);
				validateCommand.Parameters.AddWithValue("@MaSinhVien", maSinhVien.Value);
				var isValid = validateCommand.ExecuteScalar();
				
				if (isValid == null)
					return (null, "Thông tin sinh viên không tồn tại hoặc đã bị xóa");
				
				return (maSinhVien.Value, null);
			}
			catch (Exception ex)
			{
				return (null, $"Lỗi hệ thống: {ex.Message}");
			}
		}
	}
}
