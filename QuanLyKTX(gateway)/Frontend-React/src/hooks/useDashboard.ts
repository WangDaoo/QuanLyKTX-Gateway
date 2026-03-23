// Dashboard data hook — aggregates building, room, student, bill, request stats
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../utils/constants';
import type { Building, Room, Student, Bill, ChangeRequest } from '../types/api';

interface DashboardStats {
  totalBuildings: number;
  totalRooms: number;
  totalStudents: number;
  unpaidBills: number;
  occupancyRate: number;
  emptyRooms: number;
  fullRooms: number;
  activeContracts: number;
  pendingRequests: number;
}

async function fetchDashboard(): Promise<DashboardStats> {
  const [buildings, rooms, students, bills, changeRequests] = await Promise.all([
    apiClient.get<Building[]>(ENDPOINTS.BUILDINGS),
    apiClient.get<Room[]>(ENDPOINTS.ROOMS),
    apiClient.get<Student[]>(ENDPOINTS.STUDENTS),
    apiClient.get<Bill[]>(ENDPOINTS.BILLS),
    apiClient.get<ChangeRequest[]>(ENDPOINTS.CHANGE_REQUESTS),
  ]);

  const totalBuildings = Array.isArray(buildings) ? buildings.length : 0;
  const roomsArr = Array.isArray(rooms) ? rooms : [];
  const totalRooms = roomsArr.length;
  const totalStudents = Array.isArray(students) ? students.length : 0;
  const billsArr = Array.isArray(bills) ? bills : [];
  const unpaidBills = billsArr.filter(
    (b) => b.trangThai === 'Chưa thanh toán' || b.trangThai === 'Quá hạn'
  ).length;
  const emptyRooms = roomsArr.filter((r) => r.trangThai === 'Trống').length;
  const fullRooms = roomsArr.filter(
    (r) => r.trangThai === 'Đầy' || r.trangThai === 'Đã đầy'
  ).length;
  const occupancyRate =
    totalRooms > 0 ? Math.round(((totalRooms - emptyRooms) / totalRooms) * 100) : 0;

  const changeReqArr = Array.isArray(changeRequests) ? changeRequests : [];
  const pendingRequests = changeReqArr.filter((r) => r.trangThai === 'Chờ duyệt').length;

  return {
    totalBuildings,
    totalRooms,
    totalStudents,
    unpaidBills,
    occupancyRate,
    emptyRooms,
    fullRooms,
    activeContracts: 0,
    pendingRequests,
  };
}

export function useDashboard() {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });
}
