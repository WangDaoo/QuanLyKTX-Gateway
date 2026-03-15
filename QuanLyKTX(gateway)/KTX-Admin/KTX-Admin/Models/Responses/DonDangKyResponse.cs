namespace KTX_Admin.Models.Responses
{
    public sealed class DonDangKyResponse
    {
        public int MaDon { get; set; }
        public int MaSinhVien { get; set; }
        public int? MaPhongDeXuat { get; set; }
        public string TrangThai { get; set; } = "Chờ duyệt";
        public string? LyDo { get; set; }
        public DateTime NgayDangKy { get; set; }
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; }
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
        public string? TenSinhVien { get; set; }
        public string? MSSV { get; set; }
        public string? Lop { get; set; }
        public string? Khoa { get; set; }
        public string? PhongDeXuat { get; set; }
        public string? ToaNhaDeXuat { get; set; }
    }
}



