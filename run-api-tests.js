/**
 * QuanLyKTX — Full API Test Suite v2
 * Fixed ID extraction + use existing DB data
 */
const http = require('http');

const BASE = { admin: 'http://localhost:8001', user: 'http://localhost:8002', gw: 'http://localhost:8000' };

let adminToken, officerToken, studentToken;
let created = {};  // IDs đã tạo

// ── HTTP helper ──────────────────────────────────────────────────────────────
function req(method, base, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(base + path);
    const opts = {
      hostname: url.hostname, port: url.port,
      path: url.pathname + url.search, method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    const r = http.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        let j = null;
        try { j = JSON.parse(d); } catch { j = d; }
        resolve({ status: res.statusCode, body: j });
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

// ── ID extractor — handles {data:{MaX: id}} or {MaX: id} or {maX: id} ─────
function extractId(body, key) {
  // Try camelCase first (maToaNha)
  if (body?.data?.[`ma${key}`]) return body.data[`ma${key}`];
  if (body?.data?.[`Ma${key}`]) return body.data[`Ma${key}`];
  // Try flat
  if (body?.[`ma${key}`]) return body[`ma${key}`];
  if (body?.[`Ma${key}`]) return body[`Ma${key}`];
  return null;
}

// ── Test helper ─────────────────────────────────────────────────────────────
async function test(id, r, expectedStatus, checkFn, msg) {
  const statusOk = Array.isArray(expectedStatus)
    ? expectedStatus.includes(r.status)
    : r.status === expectedStatus;
  const ok = statusOk && checkFn(r);
  console.log(`${ok ? '✅' : '❌'} [${id}] ${msg} → HTTP ${r.status}`);
  if (!ok) {
    console.log(`       Payload: ${JSON.stringify(r.body).substring(0, 200)}`);
  }
  return ok;
}

// ── Preload: lấy existing data từ DB ───────────────────────────────────────
async function loadExistingData() {
  const users = (await req('GET', BASE.admin, '/api/auth/users', null, adminToken)).body;
  const usersList = users.data || [];
  const studentUser = usersList.find(u => u.TenDangNhap === 'SVTEST99');
  created.studentUserId = studentUser?.MaTaiKhoan;
  created.studentMaSV = studentUser?.MSSV; // might be null

  const students = (await req('GET', BASE.admin, '/api/students', null, adminToken)).body;
  const stList = students.data || [];
  const svTest99 = stList.find(s => s.MSSV === 'SVTEST99');
  created.studentId = svTest99?.MaSinhVien;

  const rooms = (await req('GET', BASE.admin, '/api/rooms', null, adminToken)).body;
  const roomList = rooms.data || [];
  created.roomId = roomList[0]?.MaPhong || roomList[0]?.maPhong;
  created.roomId2 = roomList[1]?.MaPhong || roomList[1]?.maPhong;

  const beds = (await req('GET', BASE.admin, '/api/beds', null, adminToken)).body;
  const bedList = beds.data || beds || [];
  // Find beds in room 1
  const bedsInRoom1 = bedList.filter(b => String(b.MaPhong || b.maPhong) === String(created.roomId));
  created.bedId = bedsInRoom1[0]?.MaGiuong || bedsInRoom1[0]?.maGiuong;
  created.bedId2 = bedsInRoom1[1]?.MaGiuong || bedsInRoom1[1]?.maGiuong;

  const buildings = (await req('GET', BASE.admin, '/api/buildings', null, adminToken)).body;
  const bldList = buildings.data || [];
  created.buildingId = bldList[0]?.MaToaNha || bldList[0]?.maToaNha;
  created.buildingId2 = bldList[1]?.MaToaNha || bldList[1]?.maToaNha;

  console.log('\n📦 Preloaded IDs:');
  console.log(`   studentUserId=${created.studentUserId}, studentId=${created.studentId}`);
  console.log(`   roomId=${created.roomId}, bedId=${created.bedId}`);
  console.log(`   buildingId=${created.buildingId}`);
}

// ── TESTS ──────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   QuanLyKTX — FULL API TEST SUITE v2               ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  // ── Nhóm 0: Auth ──────────────────────────────────────────────────────────
  console.log('\n🔐 NHÓM 0 — AUTHENTICATION');

  let r = await req('POST', BASE.admin, '/api/auth/login', { TenDangNhap: 'admin', MatKhau: 'admin@123' });
  adminToken = r.body.token;
  await test('0.1', r, 200, x => x.body.success, 'Login Admin');

  r = await req('POST', BASE.admin, '/api/auth/login', { TenDangNhap: 'officer', MatKhau: 'officer@123' });
  officerToken = r.body.token;
  await test('0.2', r, 200, x => x.body.success, 'Login Officer');

  r = await req('POST', BASE.admin, '/api/auth/login', { TenDangNhap: 'SVTEST99', MatKhau: 'SVTEST99' });
  studentToken = r.body.token;
  await test('0.3', r, 200, x => x.body.success, 'Login Student (SVTEST99/SVTEST99)');

  r = await req('POST', BASE.admin, '/api/auth/login', { TenDangNhap: 'admin', MatKhau: 'wrong' });
  await test('0.4', r, 401, x => true, 'Login sai password → 401');

  r = await req('POST', BASE.admin, '/api/auth/register', {
    TenDangNhap: `TEST_${Date.now()}`, MatKhau: 'Test@123', HoTen: 'Test User',
    Email: `test_${Date.now()}@test.com`, VaiTro: 'Student'
  });
  await test('0.5', r, [200, 201], x => x.body.success, 'Register account mới');

  r = await req('POST', BASE.admin, '/api/auth/register', {
    TenDangNhap: 'admin', MatKhau: 'pass', HoTen: 'Hacker',
    Email: 'hacker@hack.com', VaiTro: 'Admin'
  });
  await test('0.6', r, 400, x => x.status !== 201, 'Register trùng username → reject');

  r = await req('GET', BASE.admin, '/api/auth/users', null, null);
  await test('0.7', r, 401, x => x.status === 401, 'Gọi API không có token → 401');

  r = await req('GET', BASE.user, '/api/home', null, null);
  await test('0.8', r, 200, x => x.body.data?.status === 'ok', 'Health check User API');

  // ── Load existing data ────────────────────────────────────────────────────
  await loadExistingData();

  // ── Nhóm 1: Auth Management ──────────────────────────────────────────────
  console.log('\n🔐 NHÓM 1 — AUTH MANAGEMENT');

  r = await req('GET', BASE.admin, '/api/auth/users', null, adminToken);
  const users = r.body.data || [];
  await test('1.1', r, 200, x => x.status === 200, `Get All Users → ${users.length} accounts`);

  r = await req('GET', BASE.admin, '/api/auth/users', null, officerToken);
  await test('1.2', r, 403, x => x.status === 403, 'Officer gọi Get Users → 403');

  if (users[0]) {
    r = await req('GET', BASE.admin, `/api/auth/users/${users[0].MaTaiKhoan}`, null, adminToken);
    await test('1.3', r, 200, x => x.status === 200, `Get User by ID ${users[0].MaTaiKhoan}`);
  }

  r = await req('POST', BASE.admin, '/api/auth/change-password',
    { OldPassword: 'admin@123', NewPassword: 'admin@123' }, adminToken);
  await test('1.4', r, 200, x => x.body.success, 'Change password (giữ nguyên)');

  r = await req('POST', BASE.admin, '/api/auth/change-password',
    { OldPassword: 'wrongold', NewPassword: 'new' }, adminToken);
  await test('1.5', r, 400, x => x.status !== 200, 'Change password sai old → reject');

  // ── Nhóm 2A: Tòa Nhà ──────────────────────────────────────────────────────
  console.log('\n🏢 NHÓM 2A — TÒA NHÀ');

  r = await req('POST', BASE.admin, '/api/buildings', {
    TenToaNha: 'Tòa Test', DiaChi: '123 Test', SoTang: 3, TrangThai: true, MoTa: 'Test building'
  }, adminToken);
  const newBId = extractId(r.body, 'ToaNha');
  await test('2A.1', r, 201, x => x.body.success, `Create Building → ID: ${newBId || '?'}`);
  created.newBuildingId = newBId;

  r = await req('GET', BASE.admin, '/api/buildings', null, adminToken);
  const bldList = r.body.data || [];
  await test('2A.2', r, 200, x => x.status === 200, `Get Buildings → ${bldList.length} buildings`);

  if (created.newBuildingId) {
    r = await req('GET', BASE.admin, `/api/buildings/${created.newBuildingId}`, null, adminToken);
    await test('2A.3', r, 200, x => x.status === 200, `Get Building by ID ${created.newBuildingId}`);

    r = await req('PUT', BASE.admin, `/api/buildings/${created.newBuildingId}`, {
      TenToaNha: 'Tòa Test Updated', DiaChi: '456 New', SoTang: 4, TrangThai: true, MoTa: 'Updated'
    }, adminToken);
    await test('2A.4', r, 200, x => x.status === 200, `Update Building ${created.newBuildingId}`);

    r = await req('DELETE', BASE.admin, `/api/buildings/${created.newBuildingId}`, null, adminToken);
    await test('2A.5', r, 200, x => x.status === 200, `Delete Building ${created.newBuildingId}`);
  }

  // ── Nhóm 2B: Phòng ────────────────────────────────────────────────────────
  console.log('\n🏠 NHÓM 2B — PHÒNG');

  r = await req('POST', BASE.admin, '/api/rooms', {
    SoPhong: `T${Date.now()}`.slice(-6),
    MaToaNha: created.buildingId,
    SoGiuong: 4,
    LoaiPhong: 'Phòng 4 người',
    GiaPhong: 500000,
    TrangThai: 'Trống',
    MoTa: 'Test room'
  }, adminToken);
  const newRId = extractId(r.body, 'Phong');
  await test('2B.1', r, 201, x => x.body.success, `Create Room → ID: ${newRId || '?'}`);
  created.newRoomId = newRId;

  r = await req('GET', BASE.admin, '/api/rooms', null, adminToken);
  const roomList = r.body.data || [];
  await test('2B.2', r, 200, x => x.status === 200, `Get Rooms → ${roomList.length} rooms`);

  if (created.newRoomId) {
    r = await req('GET', BASE.admin, `/api/rooms/${created.newRoomId}`, null, adminToken);
    await test('2B.3', r, 200, x => x.status === 200, `Get Room by ID ${created.newRoomId}`);

    r = await req('PUT', BASE.admin, `/api/rooms/${created.newRoomId}`, {
      SoPhong: `U${Date.now()}`.slice(-6),
      MaToaNha: created.buildingId,
      SoGiuong: 4, LoaiPhong: 'Phòng 4 người',
      GiaPhong: 600000, TrangThai: 'Trống', MoTa: 'Updated'
    }, adminToken);
    await test('2B.4', r, 200, x => x.status === 200, `Update Room ${created.newRoomId}`);

    r = await req('DELETE', BASE.admin, `/api/rooms/${created.newRoomId}`, null, adminToken);
    await test('2B.5', r, 200, x => x.status === 200, `Delete Room ${created.newRoomId}`);
  }

  r = await req('GET', BASE.admin, '/api/rooms/empty', null, adminToken);
  await test('2B.6', r, 200, x => x.status === 200, 'Get Empty Rooms');

  // ── Nhóm 2C: Giường ───────────────────────────────────────────────────────
  console.log('\n🛏️ NHÓM 2C — GIƯỜNG');

  r = await req('GET', BASE.admin, '/api/beds', null, adminToken);
  const bedList = r.body.data || r.body || [];
  await test('2C.1', r, 200, x => x.status === 200, `Get All Beds → ${bedList.length} beds`);

  if (created.newRoomId) {
    r = await req('GET', BASE.admin, `/api/beds?maPhong=${created.newRoomId}`, null, adminToken);
    await test('2C.2', r, 200, x => x.status === 200, `Get Beds by Room ${created.newRoomId}`);
  }

  if (bedList[0]) {
    const bid = bedList[0].MaGiuong || bedList[0].maGiuong;
    r = await req('PUT', BASE.admin, `/api/beds/${bid}`, {
      SoGiuong: 'Giường 1',
      MaPhong: created.newRoomId || bedList[0].MaPhong,
      TrangThai: 'Đã cho thuê', MoTa: 'Test update'
    }, adminToken);
    await test('2C.3', r, 200, x => x.status === 200, `Update Bed ${bid} → Đã cho thuê`);
  }

  // ── Nhóm 3: Sinh Viên ────────────────────────────────────────────────────
  console.log('\n👥 NHÓM 3 — SINH VIÊN');

  r = await req('GET', BASE.admin, '/api/students', null, adminToken);
  const stList = r.body.data || [];
  await test('3.1', r, 200, x => x.status === 200, `Get Students → ${stList.length} students`);

  r = await req('POST', BASE.admin, '/api/students', {
    HoTen: 'Test Student',
    MSSV: `SV${Date.now()}`.slice(-10),
    Lop: 'CNTT01',
    Khoa: 'Công nghệ thông tin',
    NgaySinh: '2000-01-01',
    GioiTinh: 'Nam',
    SDT: '0912345678',
    Email: `sv${Date.now()}@test.com`,
    DiaChi: 'TP HCM'
  }, adminToken);
  const newStId = extractId(r.body, 'SinhVien');
  await test('3.2', r, 201, x => x.body.success, `Create Student → ID: ${newStId || '?'}`);
  created.newStudentId = newStId;

  if (created.newStudentId) {
    r = await req('GET', BASE.admin, `/api/students/${created.newStudentId}`, null, adminToken);
    await test('3.3', r, 200, x => x.status === 200, `Get Student by ID ${created.newStudentId}`);

    r = await req('PUT', BASE.admin, `/api/students/${created.newStudentId}`, {
      HoTen: 'Test Student Updated',
      MSSV: `SV${Date.now()}`.slice(-10),
      Lop: 'CNTT02',
      Khoa: 'CNTT',
      NgaySinh: '2000-01-01',
      GioiTinh: 'Nam',
      SDT: '0999888777',
      Email: `sv2${Date.now()}@test.com`,
      DiaChi: 'Hà Nội'
    }, adminToken);
    await test('3.4', r, 200, x => x.status === 200, `Update Student ${created.newStudentId}`);
  }

  if (created.roomId) {
    r = await req('GET', BASE.admin, `/api/students/by-room/${created.roomId}`, null, adminToken);
    await test('3.5', r, 200, x => x.status === 200, `Get Students by Room ${created.roomId}`);
  }

  // ── Nhóm 4A: Hợp Đồng ──────────────────────────────────────────────────
  console.log('\n📋 NHÓM 4A — HỢP ĐỒNG');

  // Use existing data: existing student with no contract
  const targetStudentId = created.studentId || stList.find(s => !s.MaPhong)?.MaSinhVien;
  // Chọn giường trống thật sự để tránh conflict
  const freeBed = bedList.find(b => (b.TrangThai || '').toLowerCase().includes('trống') || (b.TrangThai || '').toLowerCase().includes('trong'));
  const targetBedId = freeBed?.MaGiuong || freeBed?.maGiuong;

  r = await req('POST', BASE.admin, '/api/contracts', {
    MaSinhVien: targetStudentId,
    MaGiuong: targetBedId,
    NgayBatDau: '2026-04-01',
    NgayKetThuc: '2027-04-01',
    GiaPhong: 500000,
    TrangThai: 'Có hiệu lực',
    GhiChu: 'Test contract'
  }, adminToken);
  const newCId = extractId(r.body, 'HopDong');
  await test('4A.1', r, 201, x => x.body.success || x.status === 201, `Create Contract (student=${targetStudentId}, bed=${targetBedId}) → ID: ${newCId || '?'}`);
  created.contractId = newCId;

  r = await req('GET', BASE.admin, '/api/contracts', null, adminToken);
  await test('4A.2', r, 200, x => x.status === 200, 'Get Contracts');

  if (created.contractId) {
    r = await req('GET', BASE.admin, `/api/contracts/${created.contractId}`, null, adminToken);
    await test('4A.3', r, 200, x => x.status === 200, `Get Contract by ID ${created.contractId}`);

    r = await req('POST', BASE.admin, `/api/contracts/${created.contractId}/extend`, { SoThangGiaHan: 6 }, adminToken);
    await test('4A.4', r, 200, x => x.status === 200, `Extend Contract ${created.contractId} +6 tháng`);

    if (targetStudentId) {
      r = await req('GET', BASE.admin, `/api/contracts/student/${targetStudentId}/current`, null, adminToken);
      await test('4A.5', r, [200,404], x => true, `Get Current Contract by Student ${targetStudentId}`);
    }

    // Giữ lại contract để test User API current contract/room, sẽ cleanup cuối cùng
    created.contractForUserTests = created.contractId;
  } else {
    console.log('⚠️ [4A] Không tạo được hợp đồng nên bỏ qua các test contract liên quan');
  }

  // ── Nhóm 4B: Đăng Ký ────────────────────────────────────────────────────
  console.log('\n📝 NHÓM 4B — ĐƠN ĐĂNG KÝ');

  r = await req('POST', BASE.admin, '/api/registrations', {
    MaSinhVien: created.newStudentId || targetStudentId,
    MaPhongDeXuat: created.newRoomId || created.roomId,
    NgayDangKy: '2026-03-28',
    TrangThai: 'Chờ duyệt',
    LyDo: 'Test registration',
    GhiChu: 'Test'
  }, adminToken);
  const newRegId = extractId(r.body, 'Don');
  await test('4B.1', r, 201, x => x.body.success || x.status === 201, `Create Registration → ID: ${newRegId || '?'}`);
  created.regId = newRegId;

  r = await req('GET', BASE.admin, '/api/registrations', null, adminToken);
  await test('4B.2', r, 200, x => x.status === 200, 'Get Registrations');

  if (created.regId) {
    // Lấy registration hiện tại để update đủ field bắt buộc (tránh FK constraint)
    const regGet = await req('GET', BASE.admin, `/api/registrations/${created.regId}`, null, adminToken);
    const regData = regGet.body?.data;

    if (regData) {
      r = await req('PUT', BASE.admin, `/api/registrations/${created.regId}`, {
        MaSinhVien: regData.MaSinhVien,
        MaPhongDeXuat: regData.MaPhongDeXuat,
        NgayDangKy: regData.NgayDangKy,
        TrangThai: 'Từ chối',
        LyDo: 'Test rejection',
        GhiChu: 'Test'
      }, adminToken);
      await test('4B.3', r, 200, x => x.status === 200, `Reject Registration ${created.regId}`);
    } else {
      console.log(`⚠️ [4B.3] Không lấy được dữ liệu registration ${created.regId} để update`);
    }
  }

  // ── Nhóm 4C: Yêu Cầu Chuyển Phòng ──────────────────────────────────────
  console.log('\n🔄 NHÓM 4C — YÊU CẦU CHUYỂN PHÒNG');

  r = await req('POST', BASE.admin, '/api/change-requests', {
    MaSinhVien: created.newStudentId || targetStudentId,
    PhongHienTai: created.roomId,
    PhongMongMuon: created.roomId2,
    NgayYeuCau: '2026-03-28',
    TrangThai: 'Chờ duyệt',
    LyDo: 'Test change request'
  }, adminToken);
  const newCrId = extractId(r.body, 'YeuCau');
  await test('4C.1', r, 201, x => x.body.success || x.status === 201, `Create Change Request → ID: ${newCrId || '?'}`);
  created.changeReqId = newCrId;

  r = await req('GET', BASE.admin, '/api/change-requests', null, adminToken);
  await test('4C.2', r, 200, x => x.status === 200, 'Get Change Requests');

  // ── Nhóm 5: Tài Chính ────────────────────────────────────────────────────
  console.log('\n💰 NHÓM 5 — TÀI CHÍNH');

  // 5A Bậc Giá
  r = await req('POST', BASE.admin, '/api/price-tiers', {
    Loai: 'Dien', ThuTu: 10, TuSo: 200, DenSo: 500, DonGia: 3000, TrangThai: true
  }, adminToken);
  const newPtId = extractId(r.body, 'Bac');
  await test('5A.1', r, 201, x => x.body.success || x.status === 201, `Create Price Tier → ID: ${newPtId || '?'}`);
  created.priceTierId = newPtId;

  r = await req('GET', BASE.admin, '/api/price-tiers', null, adminToken);
  await test('5A.2', r, 200, x => x.status === 200, 'Get Price Tiers');

  if (newPtId) {
    r = await req('GET', BASE.admin, `/api/price-tiers/${newPtId}`, null, adminToken);
    await test('5A.3', r, 200, x => x.status === 200, `Get Price Tier by ID ${newPtId}`);

    r = await req('PUT', BASE.admin, `/api/price-tiers/${newPtId}`, {
      Loai: 'Dien', ThuTu: 10, TuSo: 200, DenSo: 500, DonGia: 3500, TrangThai: true
    }, adminToken);
    await test('5A.4', r, 200, x => x.status === 200, `Update Price Tier ${newPtId}`);
  }

  // 5B Chỉ Số Điện Nước
  r = await req('POST', BASE.admin, '/api/meter-readings', {
    MaPhong: created.roomId, Thang: 4, Nam: 2026,
    ChiSoDien: 100, ChiSoNuoc: 20,
    NguoiGhi: 'admin', TrangThai: 'Đã ghi'
  }, adminToken);
  const newMrId = extractId(r.body, 'ChiSo');
  await test('5B.1', r, 201, x => x.body.success || x.status === 201, `Create Meter Reading → ID: ${newMrId || '?'}`);
  created.meterReadingId = newMrId;

  r = await req('GET', BASE.admin, '/api/meter-readings', null, adminToken);
  await test('5B.2', r, 200, x => x.status === 200, 'Get Meter Readings');

  if (newMrId) {
    r = await req('PUT', BASE.admin, `/api/meter-readings/${newMrId}`, {
      MaPhong: created.roomId, Thang: 4, Nam: 2026,
      ChiSoDien: 110, ChiSoNuoc: 22, NguoiGhi: 'admin', TrangThai: 'Đã ghi'
    }, adminToken);
    await test('5B.3', r, 200, x => x.status === 200, `Update Meter Reading ${newMrId}`);
  }

  if (created.roomId) {
    r = await req('GET', BASE.admin, `/api/meter-readings/by-room/${created.roomId}`, null, adminToken);
    await test('5B.4', r, 200, x => x.status === 200, `Get Meter Readings by Room ${created.roomId}`);

    r = await req('GET', BASE.admin, `/api/meter-readings/by-month/4/2026`, null, adminToken);
    await test('5B.5', r, 200, x => x.status === 200, 'Get Meter Readings by Month 4/2026');
  }

  r = await req('GET', BASE.admin, '/api/meter-readings/template', null, adminToken);
  await test('5B.6', r, 200, x => x.status === 200, 'Download Excel Template');

  // 5C Mức Phí
  r = await req('POST', BASE.admin, '/api/fees', {
    TenMucPhi: 'Test Fee',
    LoaiPhi: 'DichVu',
    GiaTien: 100000,
    DonVi: 'VND/tháng',
    TrangThai: true,
    GhiChu: 'Test'
  }, adminToken);
  const newFeeId = extractId(r.body, 'MucPhi');
  await test('5C.1', r, 201, x => x.body.success || x.status === 201, `Create Fee → ID: ${newFeeId || '?'}`);
  created.feeId = newFeeId;

  r = await req('GET', BASE.admin, '/api/fees', null, adminToken);
  await test('5C.2', r, 200, x => x.status === 200, 'Get Fees');

  if (newFeeId) {
    r = await req('PUT', BASE.admin, `/api/fees/${newFeeId}`, {
      TenMucPhi: 'Test Fee Updated', LoaiPhi: 'DichVu', GiaTien: 150000, DonVi: 'VND/tháng', TrangThai: true
    }, adminToken);
    await test('5C.3', r, 200, x => x.status === 200, `Update Fee ${newFeeId}`);
  }

  // 5D Cấu Hình Phí (Admin only)
  r = await req('POST', BASE.admin, '/api/fee-configs', {
    Loai: 'Dien', MucToiThieu: 50000, TrangThai: true
  }, adminToken);
  const newFcId = extractId(r.body, 'CauHinh');
  await test('5D.1', r, 201, x => x.body.success || x.status === 201, `Create Fee Config → ID: ${newFcId || '?'}`);
  created.feeConfigId = newFcId;

  r = await req('GET', BASE.admin, '/api/fee-configs', null, adminToken);
  await test('5D.2', r, 200, x => x.status === 200, 'Get Fee Configs');

  r = await req('GET', BASE.admin, '/api/fee-configs/by-type/Dien', null, adminToken);
  await test('5D.3', r, 200, x => x.status === 200, 'Get Fee Configs by Type Dien');

  // Officer cannot access fee-configs
  r = await req('GET', BASE.admin, '/api/fee-configs', null, officerToken);
  await test('5D.4', r, 403, x => x.status === 403, 'Officer gọi Fee Configs → 403');

  // 5E Hóa Đơn
  r = await req('POST', BASE.admin, '/api/bills', {
    MaSinhVien: targetStudentId || created.studentId,
    Thang: 4, Nam: 2026,
    TongTien: 650000,
    TrangThai: 'Chưa thanh toán',
    HanThanhToan: '2026-04-15'
  }, adminToken);
  const newBillId = extractId(r.body, 'HoaDon');
  await test('5E.1', r, 201, x => x.body.success || x.status === 201, `Create Bill → ID: ${newBillId || '?'}`);
  created.billId = newBillId;

  r = await req('GET', BASE.admin, '/api/bills', null, adminToken);
  await test('5E.2', r, 200, x => x.status === 200, 'Get Bills');

  if (newBillId) {
    r = await req('GET', BASE.admin, `/api/bills/${newBillId}`, null, adminToken);
    await test('5E.3', r, 200, x => x.status === 200, `Get Bill by ID ${newBillId}`);

    // Lấy bill đầy đủ để update đủ field bắt buộc (tránh CK_HoaDon_MonthYear)
    const billGet = await req('GET', BASE.admin, `/api/bills/${newBillId}`, null, adminToken);
    const billData = billGet.body?.data;

    if (billData) {
      r = await req('PUT', BASE.admin, `/api/bills/${newBillId}`, {
        MaSinhVien: billData.MaSinhVien,
        MaPhong: billData.MaPhong,
        MaHopDong: billData.MaHopDong,
        Thang: billData.Thang,
        Nam: billData.Nam,
        TongTien: billData.TongTien,
        TrangThai: 'Đã thanh toán',
        HanThanhToan: billData.HanThanhToan,
        NgayThanhToan: '2026-03-28',
        GhiChu: 'Paid via test'
      }, adminToken);
      await test('5E.4', r, 200, x => x.status === 200, `Update Bill ${newBillId} → Đã thanh toán`);
    } else {
      console.log(`⚠️ [5E.4] Không lấy được bill ${newBillId} để update`);
    }
  }

  r = await req('POST', BASE.admin, '/api/bills/calculate-monthly?thang=4&nam=2026', null, adminToken);
  await test('5E.5', r, 200, x => x.status === 200, 'Calculate Monthly Bills 4/2026');

  // 5F Biên Lai
  r = await req('POST', BASE.admin, '/api/receipts', {
    MaHoaDon: newBillId || created.billId,
    SoTienThu: 650000,
    NgayThu: '2026-03-28',
    PhuongThucThanhToan: 'Tiền mặt',
    NguoiThu: 'admin',
    GhiChu: 'Test receipt'
  }, adminToken);
  const newRcId = extractId(r.body, 'BienLai');
  await test('5F.1', r, 201, x => x.body.success || x.status === 201, `Create Receipt → ID: ${newRcId || '?'}`);
  created.receiptId = newRcId;

  r = await req('GET', BASE.admin, '/api/receipts', null, adminToken);
  await test('5F.2', r, 200, x => x.status === 200, 'Get Receipts');

  // ── Nhóm 6: Kỷ Luật & Điểm Rèn Luyện ────────────────────────────────────
  console.log('\n⚠️ NHÓM 6 — KỶ LUẬT & ĐIỂM RÈN LUYỆN');

  r = await req('POST', BASE.admin, '/api/violations', {
    MaSinhVien: targetStudentId || created.studentId,
    LoaiViPham: 'Vi phạm nội quy',
    MoTa: 'Test violation',
    NgayViPham: '2026-03-20',
    MucPhat: 50000,
    TrangThai: 'Chưa xử lý'
  }, adminToken);
  const newVId = extractId(r.body, 'KyLuat');
  await test('6A.1', r, 201, x => x.body.success || x.status === 201, `Create Violation → ID: ${newVId || '?'}`);
  created.violationId = newVId;

  r = await req('GET', BASE.admin, '/api/violations', null, adminToken);
  await test('6A.2', r, 200, x => x.status === 200, 'Get Violations');

  if (newVId) {
    r = await req('PUT', BASE.admin, `/api/violations/${newVId}`, {
      TrangThai: 'Đã xử lý', MoTa: 'Test violation updated'
    }, adminToken);
    await test('6A.3', r, 200, x => x.status === 200, `Update Violation ${newVId}`);
  }

  r = await req('POST', BASE.admin, '/api/discipline-scores', {
    MaSinhVien: targetStudentId || created.studentId,
    Thang: 3, Nam: 2026,
    DiemSo: 85,
    XepLoai: 'Khá',
    GhiChu: 'Test score'
  }, adminToken);
  const newDsId = extractId(r.body, 'Diem');
  await test('6B.1', r, 201, x => x.body.success || x.status === 201, `Create Discipline Score → ID: ${newDsId || '?'}`);
  created.disciplineScoreId = newDsId;

  r = await req('GET', BASE.admin, '/api/discipline-scores', null, adminToken);
  await test('6B.2', r, 200, x => x.status === 200, 'Get Discipline Scores');

  // ── Nhóm 7: Thông Báo Quá Hạn ───────────────────────────────────────────
  console.log('\n📢 NHÓM 7 — THÔNG BÁO QUÁ HẠN');

  r = await req('POST', BASE.admin, '/api/overdue-notices', {
    MaSinhVien: targetStudentId || created.studentId,
    MaHoaDon: newBillId || created.billId,
    NgayThongBao: '2026-03-28',
    NoiDung: 'Test overdue notice',
    TrangThai: 'Đã gửi'
  }, adminToken);
  const newOnId = extractId(r.body, 'ThongBao');
  await test('7.1', r, 201, x => x.body.success || x.status === 201, `Create Overdue Notice → ID: ${newOnId || '?'}`);
  created.overdueNoticeId = newOnId;

  r = await req('GET', BASE.admin, '/api/overdue-notices', null, adminToken);
  await test('7.2', r, 200, x => x.status === 200, 'Get Overdue Notices');

  // ── Nhóm 8: Báo Cáo ────────────────────────────────────────────────────
  console.log('\n📊 NHÓM 8 — BÁO CÁO');

  r = await req('GET', BASE.admin, '/api/reports/occupancy-rate?thang=3&nam=2026', null, adminToken);
  await test('8.1', r, 200, x => x.status === 200, 'Occupancy Rate Report');

  r = await req('GET', BASE.admin, '/api/reports/revenue?thang=3&nam=2026', null, adminToken);
  await test('8.2', r, 200, x => x.status === 200, 'Revenue Report');

  r = await req('GET', BASE.admin, '/api/reports/debt?thang=3&nam=2026', null, adminToken);
  await test('8.3', r, 200, x => x.status === 200, 'Debt Report');

  r = await req('GET', BASE.admin, '/api/reports/electricity-water?thang=3&nam=2026', null, adminToken);
  await test('8.4', r, 200, x => x.status === 200, 'Electricity Water Report');

  r = await req('GET', BASE.admin, '/api/reports/violations?thang=3&nam=2026', null, adminToken);
  await test('8.5', r, 200, x => x.status === 200, 'Violations Report');

  r = await req('POST', BASE.admin, '/api/reports/calculate-electricity?soKwh=150&thang=3&nam=2026', null, adminToken);
  await test('8.6', r, 200, x => x.status === 200, 'Calculate Electricity 150kWh');

  r = await req('POST', BASE.admin, '/api/reports/calculate-water?soKhoi=20&thang=3&nam=2026', null, adminToken);
  await test('8.7', r, 200, x => x.status === 200, 'Calculate Water 20m³');

  r = await req('POST', BASE.admin, '/api/reports/generate-monthly-bills?thang=5&nam=2026', null, adminToken);
  await test('8.8', r, 200, x => x.status === 200, 'Generate Monthly Bills 5/2026');

  // ── Nhóm 9: User API ─────────────────────────────────────────────────────
  console.log('\n👤 NHÓM 9 — USER API');

  // Login as SVTEST99 (student) to test user endpoints
  if (!studentToken) {
    const stLogin = await req('POST', BASE.admin, '/api/auth/login', { TenDangNhap: 'SVTEST99', MatKhau: 'SVTEST99' });
    studentToken = stLogin.body.token;
  }

  r = await req('GET', BASE.user, '/api/students/profile', null, studentToken);
  await test('9A.1', r, 200, x => x.status === 200, 'Get My Profile');

  r = await req('PUT', BASE.user, '/api/students/profile', { HoTen: 'Updated Name', SDT: '0999888777' }, studentToken);
  await test('9A.2', r, 200, x => x.status === 200, 'Update My Profile');

  r = await req('GET', BASE.user, '/api/bills/my', null, studentToken);
  await test('9B.1', r, 200, x => x.status === 200, 'Get My Bills');

  r = await req('GET', BASE.user, '/api/contracts/my', null, studentToken);
  await test('9C.1', r, 200, x => x.status === 200, 'Get My Contracts');

  r = await req('GET', BASE.user, '/api/contracts/my/current', null, studentToken);
  await test('9C.2', r, [200,404], x => true, 'Get My Current Contract (200 nếu có, 404 nếu chưa có)');

  // Nếu chưa có current contract thì tạo nhanh 1 hợp đồng cho SVTEST99 để test chuỗi phụ thuộc room/current
  if (r.status === 404) {
    const contracts = await req('GET', BASE.admin, '/api/contracts', null, adminToken);
    const hasContract = (contracts.body?.data || []).some(c => c.MaSinhVien === created.studentId && !c.IsDeleted);

    if (!hasContract && created.studentId && targetBedId) {
      const createCurrent = await req('POST', BASE.admin, '/api/contracts', {
        MaSinhVien: created.studentId,
        MaGiuong: targetBedId,
        NgayBatDau: '2026-01-01',
        NgayKetThuc: '2027-12-31',
        GiaPhong: 500000,
        TrangThai: 'Có hiệu lực',
        GhiChu: 'Auto-created for user current contract test'
      }, adminToken);
      created.autoCurrentContractId = extractId(createCurrent.body, 'HopDong');
    }

    const retry = await req('GET', BASE.user, '/api/contracts/my/current', null, studentToken);
    await test('9C.2b', retry, [200,404], x => true, 'Retry Get My Current Contract after auto-create');
  }

  r = await req('GET', BASE.user, '/api/registrations/my-registrations', null, studentToken);
  await test('9D.1', r, 200, x => x.status === 200, 'Get My Registrations');

  r = await req('GET', BASE.user, '/api/buildings', null, studentToken);
  await test('9E.1', r, 200, x => x.status === 200, 'Get Buildings (Student)');

  r = await req('GET', BASE.user, '/api/rooms', null, studentToken);
  await test('9E.2', r, 200, x => x.status === 200, 'Get Rooms (Student)');

  r = await req('GET', BASE.user, '/api/rooms/available', null, studentToken);
  await test('9E.3', r, 200, x => x.status === 200, 'Get Available Rooms');

  r = await req('GET', BASE.user, '/api/rooms/current', null, studentToken);
  await test('9E.4', r, [200,404], x => true, 'Get My Current Room (200 nếu đã gán phòng, 404 nếu chưa)');

  r = await req('GET', BASE.user, '/api/fees', null, studentToken);
  await test('9E.5', r, 200, x => x.status === 200, 'Get Fees (Student)');

  r = await req('GET', BASE.user, '/api/discipline-scores/my-scores', null, studentToken);
  await test('9F.1', r, 200, x => x.status === 200, 'Get My Discipline Scores');

  r = await req('GET', BASE.user, '/api/notifications/my', null, studentToken);
  await test('9F.2', r, 200, x => x.status === 200, 'Get My Notifications');

  r = await req('GET', BASE.user, '/api/violations/my-violations', null, studentToken);
  await test('9F.3', r, 200, x => x.status === 200, 'Get My Violations');

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   ✅ TEST SUITE COMPLETED                           ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('\n📦 Created IDs:', JSON.stringify(created, null, 2));
}

run().catch(err => { console.error('ERROR:', err.message); process.exit(1); });
