// Registration & ChangeRequest hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../utils/constants';
import type { Registration, ChangeRequest } from '../types/api';

async function fetchRegistrations(): Promise<Registration[]> {
  const d = await apiClient.get<Registration[]>(ENDPOINTS.REGISTRATIONS);
  return Array.isArray(d) ? d : [];
}
async function fetchChangeRequests(): Promise<ChangeRequest[]> {
  const d = await apiClient.get<ChangeRequest[]>(ENDPOINTS.CHANGE_REQUESTS);
  return Array.isArray(d) ? d : [];
}
async function approveRegistration(id: number): Promise<void> {
  await apiClient.put(`${ENDPOINTS.REGISTRATION_BY_ID(id)}/approve`, {});
}
async function rejectRegistration(id: number, ghiChu?: string): Promise<void> {
  await apiClient.put(`${ENDPOINTS.REGISTRATION_BY_ID(id)}/reject`, { ghiChu });
}
async function approveChangeRequest(id: number): Promise<void> {
  await apiClient.put(`${ENDPOINTS.CHANGE_REQUEST_BY_ID(id)}/approve`, {});
}
async function rejectChangeRequest(id: number, ghiChu?: string): Promise<void> {
  await apiClient.put(`${ENDPOINTS.CHANGE_REQUEST_BY_ID(id)}/reject`, { ghiChu });
}

export function useRegistrations() {
  return useQuery<Registration[], Error>({
    queryKey: ['registrations'],
    queryFn: fetchRegistrations,
  });
}
export function useChangeRequests() {
  return useQuery<ChangeRequest[], Error>({
    queryKey: ['changeRequests'],
    queryFn: fetchChangeRequests,
  });
}
export function useApproveRegistration() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: approveRegistration,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registrations'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
export function useRejectRegistration() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number; ghiChu?: string }>({
    mutationFn: ({ id, ghiChu }) => rejectRegistration(id, ghiChu),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['registrations'] }),
  });
}
export function useApproveChangeRequest() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: approveChangeRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['changeRequests'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
export function useRejectChangeRequest() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number; ghiChu?: string }>({
    mutationFn: ({ id, ghiChu }) => rejectChangeRequest(id, ghiChu),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['changeRequests'] }),
  });
}
