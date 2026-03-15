namespace KTX_Admin.Models
{
    public sealed class YeuCauChuyenPhong
    {
        public int MaYeuCau { get; set; }
        public int MaSinhVien { get; set; }
        public int PhongHienTai { get; set; }
        public int? PhongMongMuon { get; set; }
        public string LyDo { get; set; } = string.Empty;
        public DateTime NgayYeuCau { get; set; } = DateTime.UtcNow;
        public string TrangThai { get; set; } = "Chờ duyệt";
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }
}



