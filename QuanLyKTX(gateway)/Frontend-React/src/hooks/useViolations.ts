// Violations hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../utils/constants';
import type { Violation } from '../types/api';

async function fetchViolations(): Promise<Violation[]> {
  const d = await apiClient.get<Violation[]>(ENDPOINTS.VIOLATIONS);
  return Array.isArray(d) ? d : [];
}

async function createViolation(payload: Partial<Violation>): Promise<void> {
  await apiClient.post(ENDPOINTS.VIOLATIONS, payload);
}

async function deleteViolation(id: number): Promise<void> {
  await apiClient.delete(ENDPOINTS.VIOLATION_BY_ID(id));
}

export function useViolations() {
  return useQuery<Violation[], Error>({
    queryKey: ['violations'],
    queryFn: fetchViolations,
  });
}

export function useCreateViolation() {
  const qc = useQueryClient();
  return useMutation<void, Error, Partial<Violation>>({
    mutationFn: createViolation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['violations'] }),
  });
}

export function useDeleteViolation() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteViolation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['violations'] }),
  });
}
