using Microsoft.Data.SqlClient;
using System.Data;

namespace KTX_Admin.Services
{
    public class OverdueBillService : BackgroundService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<OverdueBillService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(24); // Kiểm tra mỗi 24 giờ

        public OverdueBillService(IConfiguration configuration, ILogger<OverdueBillService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("OverdueBillService đã khởi động. Sẽ kiểm tra hóa đơn quá hạn mỗi {Interval} giờ.", _checkInterval.TotalHours);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessOverdueBillsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi xử lý hóa đơn quá hạn");
                }

                // Chờ đến lần kiểm tra tiếp theo
                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task ProcessOverdueBillsAsync()
        {
            var connectionString = _configuration.GetConnectionString("KTX");
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("Connection string không được cấu hình");
                return;
            }

            using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            try
            {
                // Tìm các hóa đơn quá hạn chưa thanh toán
                var query = @"
                    SELECT 
                        hd.MaHoaDon,
                        hd.MaSinhVien,
                        hd.MaPhong,
                        hd.Thang,
                        hd.Nam,
                        hd.TongTien,
                        hd.HanThanhToan,
                        s.HoTen,
                        s.MSSV,
                        p.SoPhong
                    FROM HoaDon hd
                    INNER JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
                    LEFT JOIN Phong p ON hd.MaPhong = p.MaPhong AND p.IsDeleted = 0
                    WHERE hd.TrangThai = N'Chưa thanh toán'
                        AND hd.HanThanhToan < CAST(GETDATE() AS DATE)
                        AND hd.IsDeleted = 0
                        AND NOT EXISTS (
                            SELECT 1 
                            FROM ThongBaoQuaHan tbh 
                            WHERE tbh.MaHoaDon = hd.MaHoaDon 
                                AND CAST(tbh.NgayThongBao AS DATE) = CAST(GETDATE() AS DATE)
                                AND tbh.IsDeleted = 0
                        )";

                using var command = new SqlCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                var overdueBills = new List<OverdueBillInfo>();
                while (await reader.ReadAsync())
                {
                    overdueBills.Add(new OverdueBillInfo
                    {
                        MaHoaDon = reader.GetInt32("MaHoaDon"),
                        MaSinhVien = reader.GetInt32("MaSinhVien"),
                        MaPhong = reader.IsDBNull("MaPhong") ? (int?)null : reader.GetInt32("MaPhong"),
                        Thang = reader.GetInt32("Thang"),
                        Nam = reader.GetInt32("Nam"),
                        TongTien = reader.GetDecimal("TongTien"),
                        HanThanhToan = reader.GetDateTime("HanThanhToan"),
                        HoTen = reader.GetString("HoTen"),
                        MSSV = reader.IsDBNull("MSSV") ? null : reader.GetString("MSSV"),
                        SoPhong = reader.IsDBNull("SoPhong") ? null : reader.GetString("SoPhong")
                    });
                }

                reader.Close();

                if (overdueBills.Count == 0)
                {
                    _logger.LogInformation("Không có hóa đơn quá hạn nào cần xử lý");
                    return;
                }

                _logger.LogInformation("Tìm thấy {Count} hóa đơn quá hạn cần xử lý", overdueBills.Count);

                // Tạo thông báo cho từng hóa đơn quá hạn
                foreach (var bill in overdueBills)
                {
                    await CreateOverdueNotificationAsync(connection, bill);
                }

                _logger.LogInformation("Đã xử lý {Count} hóa đơn quá hạn", overdueBills.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý hóa đơn quá hạn");
                throw;
            }
        }

        private async Task CreateOverdueNotificationAsync(SqlConnection connection, OverdueBillInfo bill)
        {
            try
            {
                var soNgayQuaHan = (DateTime.Now.Date - bill.HanThanhToan.Date).Days;
                var noiDung = $"Hóa đơn tháng {bill.Thang}/{bill.Nam} đã quá hạn {soNgayQuaHan} ngày. " +
                              $"Tổng tiền: {bill.TongTien:N0} VND. " +
                              $"Hạn thanh toán: {bill.HanThanhToan:dd/MM/yyyy}. " +
                              $"Vui lòng thanh toán sớm để tránh bị xử lý kỷ luật.";

                // Kiểm tra xem đã có thông báo cho hóa đơn này trong ngày hôm nay chưa
                var checkQuery = @"
                    SELECT COUNT(*) 
                    FROM ThongBaoQuaHan 
                    WHERE MaHoaDon = @MaHoaDon 
                        AND CAST(NgayThongBao AS DATE) = CAST(GETDATE() AS DATE)
                        AND IsDeleted = 0";

                using var checkCommand = new SqlCommand(checkQuery, connection);
                checkCommand.Parameters.AddWithValue("@MaHoaDon", bill.MaHoaDon);
                var count = (int)await checkCommand.ExecuteScalarAsync();

                if (count > 0)
                {
                    _logger.LogInformation("Đã có thông báo cho hóa đơn {MaHoaDon} trong ngày hôm nay", bill.MaHoaDon);
                    return;
                }

                // Tạo thông báo mới
                var insertQuery = @"
                    INSERT INTO ThongBaoQuaHan (MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, NguoiTao)
                    VALUES (@MaSinhVien, @MaHoaDon, GETDATE(), @NoiDung, N'Đã gửi', N'System')";

                using var insertCommand = new SqlCommand(insertQuery, connection);
                insertCommand.Parameters.AddWithValue("@MaSinhVien", bill.MaSinhVien);
                insertCommand.Parameters.AddWithValue("@MaHoaDon", bill.MaHoaDon);
                insertCommand.Parameters.AddWithValue("@NoiDung", noiDung);

                await insertCommand.ExecuteNonQueryAsync();

                _logger.LogInformation("Đã tạo thông báo quá hạn cho hóa đơn {MaHoaDon} của sinh viên {MSSV}", 
                    bill.MaHoaDon, bill.MSSV ?? bill.MaSinhVien.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo thông báo quá hạn cho hóa đơn {MaHoaDon}", bill.MaHoaDon);
            }
        }

        private class OverdueBillInfo
        {
            public int MaHoaDon { get; set; }
            public int MaSinhVien { get; set; }
            public int? MaPhong { get; set; }
            public int Thang { get; set; }
            public int Nam { get; set; }
            public decimal TongTien { get; set; }
            public DateTime HanThanhToan { get; set; }
            public string HoTen { get; set; } = string.Empty;
            public string? MSSV { get; set; }
            public string? SoPhong { get; set; }
        }
    }
}

