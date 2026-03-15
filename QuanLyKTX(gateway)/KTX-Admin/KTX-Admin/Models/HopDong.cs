namespace KTX_Admin.Models
{
    public sealed class HopDong
    {
        public int MaHopDong { get; set; }
        public int MaSinhVien { get; set; }
        public int MaGiuong { get; set; }
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public decimal GiaPhong { get; set; }
        public string TrangThai { get; set; } = "Chờ duyệt";
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }
}





