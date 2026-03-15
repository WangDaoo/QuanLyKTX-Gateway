namespace KTX_Admin.Models
{
    public sealed class ChiSoDienNuoc
    {
        public int MaChiSo { get; set; }
        public int MaPhong { get; set; }
        public int Thang { get; set; }
        public int Nam { get; set; }
        public int ChiSoDien { get; set; }
        public int ChiSoNuoc { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow; // Database dùng NgayTao, không có NgayGhi
        public string? NguoiGhi { get; set; }
        public string TrangThai { get; set; } = "Đã ghi";
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }
}




