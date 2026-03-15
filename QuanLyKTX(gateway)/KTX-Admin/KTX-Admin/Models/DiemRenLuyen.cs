namespace KTX_Admin.Models
{
	public sealed class DiemRenLuyen
	{
		public int MaDiem { get; set; }
		public int MaSinhVien { get; set; }
		public int Thang { get; set; }
		public int Nam { get; set; }
		public decimal DiemSo { get; set; }
		public string XepLoai { get; set; } = string.Empty;
		public string? GhiChu { get; set; }
		public bool IsDeleted { get; set; }
		public DateTime NgayTao { get; set; } = DateTime.UtcNow;
		public string? NguoiTao { get; set; }
		public DateTime? NgayCapNhat { get; set; }
		public string? NguoiCapNhat { get; set; }
	}
}


