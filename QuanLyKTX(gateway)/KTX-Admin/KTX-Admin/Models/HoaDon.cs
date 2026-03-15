namespace KTX_Admin.Models
{
    public sealed class HoaDon
    {
        public int MaHoaDon { get; set; }
        public int? MaSinhVien { get; set; }
        public int? MaPhong { get; set; }
        public int? MaHopDong { get; set; }
        public int Thang { get; set; }
        public int Nam { get; set; }
        public decimal TongTien { get; set; }
        public string TrangThai { get; set; } = "Chưa thanh toán";
        public DateTime? HanThanhToan { get; set; }
        public DateTime? NgayThanhToan { get; set; }
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }
}



