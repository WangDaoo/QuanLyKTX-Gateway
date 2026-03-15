namespace KTX_NguoiDung.Models
{
    public sealed class HopDong
    {
        public int MaHopDong { get; set; }
        public int MaSinhVien { get; set; }
        public int MaGiuong { get; set; }
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public decimal GiaPhong { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }

    public sealed class HoaDon
    {
        public int MaHoaDon { get; set; }
        public int MaSinhVien { get; set; }
        public int? MaPhong { get; set; }
        public int? MaHopDong { get; set; }
        public int Thang { get; set; }
        public int Nam { get; set; }
        public decimal TongTien { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public DateTime? HanThanhToan { get; set; } // Database column: HanThanhToan (nullable DATE)
        public DateTime? NgayThanhToan { get; set; }
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }

    public sealed class BienLaiThu
    {
        public int MaBienLai { get; set; }
        public int MaHoaDon { get; set; }
        public decimal SoTienThu { get; set; }
        public DateTime NgayThu { get; set; }
        public string PhuongThucThanhToan { get; set; } = string.Empty;
        public string? NguoiThu { get; set; }
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }

    public sealed class SinhVien
    {
        public int MaSinhVien { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string MSSV { get; set; } = string.Empty;
        public string Lop { get; set; } = string.Empty;
        public string Khoa { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public string? SDT { get; set; }
        public string? Email { get; set; }
        public string? DiaChi { get; set; }
        public string? AnhDaiDien { get; set; }
        public bool TrangThai { get; set; } = true;
        public int? MaPhong { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
        public string? SoPhong { get; set; } // For join results
        public string? TenToaNha { get; set; } // For join results
    }

    public sealed class Phong
    {
        public int MaPhong { get; set; }
        public int MaToaNha { get; set; }
        public string SoPhong { get; set; } = string.Empty;
        public int SoGiuong { get; set; }
        public string LoaiPhong { get; set; } = string.Empty;
        public decimal GiaPhong { get; set; }
        public string? MoTa { get; set; }
        public string TrangThai { get; set; } = "Trống";
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
        public string? TenToaNha { get; set; } // For join results
    }

    public sealed class DiemRenLuyen
    {
        public int MaDiem { get; set; }
        public int MaSinhVien { get; set; }
        public int Thang { get; set; }
        public int Nam { get; set; }
        public decimal DiemSo { get; set; }
        public string XepLoai { get; set; } = string.Empty;
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }
    public sealed class KyLuat
    {
        public int MaKyLuat { get; set; }
        public int MaSinhVien { get; set; }
        public string LoaiViPham { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public DateTime NgayViPham { get; set; } = DateTime.UtcNow;
        public decimal MucPhat { get; set; }
        public string TrangThai { get; set; } = "Chưa xử lý";
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }

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

    public sealed class ThongBaoQuaHan
    {
        public int MaThongBao { get; set; }
        public int MaSinhVien { get; set; }
        public int? MaHoaDon { get; set; }
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
