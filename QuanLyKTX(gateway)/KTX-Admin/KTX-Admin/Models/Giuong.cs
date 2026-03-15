namespace KTX_Admin.Models
{
	public sealed class Giuong
	{
		public int MaGiuong { get; set; }
		public int MaPhong { get; set; }
		public string SoGiuong { get; set; } = string.Empty;
		public string TrangThai { get; set; } = "Trống";
		public string? MoTa { get; set; }
		public bool IsDeleted { get; set; }
		public DateTime NgayTao { get; set; } = DateTime.UtcNow;
		public string? NguoiTao { get; set; }
		public DateTime? NgayCapNhat { get; set; }
		public string? NguoiCapNhat { get; set; }
	}
}
