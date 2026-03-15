namespace KTX_Admin.Models
{
	public sealed class TaiKhoan
	{
		public int MaTaiKhoan { get; set; }
		public string TenDangNhap { get; set; } = string.Empty;
		public string MatKhau { get; set; } = string.Empty;
		public string HoTen { get; set; } = string.Empty;
		public string? Email { get; set; }
		public string VaiTro { get; set; } = "User"; // Admin/Officer/Student
		public bool TrangThai { get; set; } = true;
		public bool IsDeleted { get; set; }
		public DateTime NgayTao { get; set; } = DateTime.UtcNow;
		public string? NguoiTao { get; set; }
		public DateTime? NgayCapNhat { get; set; }
		public string? NguoiCapNhat { get; set; }
		public int SoLanDangNhapSai { get; set; }
		public DateTime? NgayKhoa { get; set; }
		public int? MaSinhVien { get; set; }
	}
}



