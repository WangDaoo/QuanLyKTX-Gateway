namespace KTX_Admin.Models
{
    public sealed class ThongBaoQuaHan
    {
        public int MaThongBao { get; set; }
        public int MaSinhVien { get; set; }
        public int? MaHoaDon { get; set; } // Cho phép NULL vì một số thông báo không liên quan đến hóa đơn (ví dụ: chuyển phòng, kỷ luật)
        public DateTime NgayThongBao { get; set; } = DateTime.UtcNow;
        public string NoiDung { get; set; } = string.Empty;
        public string TrangThai { get; set; } = "Đã gửi";
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }
}




