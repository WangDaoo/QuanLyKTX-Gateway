// Student Home hook - fetches all student-specific data
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../utils/constants';
import type { Student, Room, Bill, Contract, Registration } from '../types/api';

interface HomeData {
  student?: Student;
  room?: Room & { building?: { tenToaNha: string }; bed?: { soGiuong: string } };
  bills?: Bill[];
  contracts?: Contract[];
  requests?: Registration[];
  notifications?: Array<{
    maThongBao: number;
    tieuDe: string;
    noiDung: string;
    daDoc: boolean;
    ngayTao: string;
  }>;
}

async function fetchStudentHome(): Promise<HomeData> {
  const data = await apiClient.get<HomeData>(ENDPOINTS.USER_HOME);
  return data || {};
}

export function useStudentHome() {
  return useQuery<HomeData, Error>({
    queryKey: ['studentHome'],
    queryFn: fetchStudentHome,
    staleTime: 1000 * 60 * 2,
  });
}

// Notifications
async function fetchNotifications() {
  const data = await apiClient.get(ENDPOINTS.USER_NOTIFICATIONS);
  return Array.isArray(data) ? data : [];
}
async function markNotificationRead(id: number) {
  await apiClient.put(ENDPOINTS.USER_NOTIFICATION_BY_ID(id), { daDoc: true });
}

export function useNotifications(enabled = true) {
  return useQuery<unknown[], Error>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!enabled) return [];
      return fetchNotifications();
    },
    enabled,
    retry: false,
  });
}
