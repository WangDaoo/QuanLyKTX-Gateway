namespace KTX_Admin.Models
{
    public sealed class MucPhi
    {
        public int MaMucPhi { get; set; }
        public string TenMucPhi { get; set; } = string.Empty;
        public string LoaiPhi { get; set; } = string.Empty;
        public decimal GiaTien { get; set; }
        public string? DonVi { get; set; }
        public bool TrangThai { get; set; } = true;
        public string? GhiChu { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }
}





