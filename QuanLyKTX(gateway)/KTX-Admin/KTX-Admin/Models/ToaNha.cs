namespace KTX_Admin.Models
{
	public sealed class ToaNha
	{
		public int MaToaNha { get; set; }
		public string TenToaNha { get; set; } = string.Empty;
		public string? DiaChi { get; set; }
		public int? SoTang { get; set; }
		public string? MoTa { get; set; }
		public bool TrangThai { get; set; } = true;
		public bool IsDeleted { get; set; }
		public DateTime NgayTao { get; set; } = DateTime.UtcNow;
		public string? NguoiTao { get; set; }
		public DateTime? NgayCapNhat { get; set; }
		public string? NguoiCapNhat { get; set; }
	}
}



