// Contracts CRUD hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../utils/constants';
import type { Contract } from '../types/api';

async function fetchContracts(): Promise<Contract[]> {
  const data = await apiClient.get<Contract[]>(ENDPOINTS.CONTRACTS);
  return Array.isArray(data) ? data : [];
}

async function createContract(payload: Partial<Contract>): Promise<void> {
  await apiClient.post(ENDPOINTS.CONTRACTS, payload);
}

async function extendContract(id: number, payload: { ngayKetThuc: string }): Promise<void> {
  await apiClient.put(ENDPOINTS.CONTRACT_EXTEND(id), payload);
}

async function deleteContract(id: number): Promise<void> {
  await apiClient.delete(ENDPOINTS.CONTRACT_BY_ID(id));
}

export function useContracts() {
  return useQuery<Contract[], Error>({
    queryKey: ['contracts'],
    queryFn: fetchContracts,
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation<void, Error, Partial<Contract>>({
    mutationFn: createContract,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useExtendContract() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number; payload: { ngayKetThuc: string } }>({
    mutationFn: ({ id, payload }) => extendContract(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useDeleteContract() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteContract,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
}
