namespace KTX_Admin.Models
{
	public sealed class DonDangKy
	{
		public int MaDon { get; set; }
		public int MaSinhVien { get; set; }
		public int? MaPhongDeXuat { get; set; }
		public string TrangThai { get; set; } = "Chờ duyệt";
		public string? LyDo { get; set; }
		public DateTime NgayDangKy { get; set; } = DateTime.UtcNow;
		public string? GhiChu { get; set; }
		public bool IsDeleted { get; set; }
		public DateTime NgayTao { get; set; } = DateTime.UtcNow;
		public string? NguoiTao { get; set; }
		public DateTime? NgayCapNhat { get; set; }
		public string? NguoiCapNhat { get; set; }
	}
}
