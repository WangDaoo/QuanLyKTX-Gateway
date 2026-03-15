namespace KTX_Admin.Models
{
    public sealed class ChiTietHoaDon
    {
        public int MaChiTiet { get; set; }
        public int MaHoaDon { get; set; }
        public string LoaiChiPhi { get; set; } = string.Empty;
        public int SoLuong { get; set; }
        public decimal DonGia { get; set; }
        public decimal ThanhTien { get; set; }
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }
}

