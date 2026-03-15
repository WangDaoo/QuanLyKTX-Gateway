namespace KTX_NguoiDung.Models.Responses
{
    public sealed class KyLuatResponse
    {
        public int MaKyLuat { get; set; }
        public int MaSinhVien { get; set; }
        public string LoaiViPham { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public DateTime NgayViPham { get; set; }
        public decimal MucPhat { get; set; }
        public string TrangThai { get; set; } = "Chưa xử lý";
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; }
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
        public string? TenSinhVien { get; set; }
        public string? MSSV { get; set; }
        public string? SoPhong { get; set; }
        public string? TenToaNha { get; set; }
    }
}



