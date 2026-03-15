namespace KTX_Admin.Models
{
	public sealed class SinhVien
	{
		public int MaSinhVien { get; set; }
		public string HoTen { get; set; } = string.Empty;
		public string MSSV { get; set; } = string.Empty;
		public string Lop { get; set; } = string.Empty;
		public string Khoa { get; set; } = string.Empty;
		public DateTime? NgaySinh { get; set; }
		public string? GioiTinh { get; set; }
		public string? SDT { get; set; }
		public string? Email { get; set; }
		public string? DiaChi { get; set; }
		public string? AnhDaiDien { get; set; }
		public bool TrangThai { get; set; } = true;
		public int? MaPhong { get; set; }
		public bool IsDeleted { get; set; }
		public DateTime NgayTao { get; set; } = DateTime.UtcNow;
		public string? NguoiTao { get; set; }
		public DateTime? NgayCapNhat { get; set; }
		public string? NguoiCapNhat { get; set; }
		public string? SoPhong { get; set; }
		public string? TenToaNha { get; set; }
	}
}






