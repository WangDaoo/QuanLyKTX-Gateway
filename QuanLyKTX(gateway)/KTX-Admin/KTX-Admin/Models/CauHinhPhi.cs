namespace KTX_Admin.Models
{
    public sealed class CauHinhPhi
    {
        public int MaCauHinh { get; set; }
        public string Loai { get; set; } = string.Empty; // Dien/Nuoc
        public decimal MucToiThieu { get; set; }
        public bool TrangThai { get; set; } = true;
        public bool IsDeleted { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public string? NguoiTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? NguoiCapNhat { get; set; }
    }
}


