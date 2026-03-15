namespace KTX_Admin.Models
{
    public sealed class BienLaiThu
    {
        public int MaBienLai { get; set; }
        public int MaHoaDon { get; set; }
        public decimal SoTienThu { get; set; }
        public DateTime NgayThu { get; set; } = DateTime.UtcNow;
        public string PhuongThucThanhToan { get; set; } = "Tiền mặt";
        public string? NguoiThu { get; set; }
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }
}




