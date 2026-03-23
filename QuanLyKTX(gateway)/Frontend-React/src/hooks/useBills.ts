// Bills CRUD hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../utils/constants';
import type { Bill } from '../types/api';

async function fetchBills(): Promise<Bill[]> {
  const data = await apiClient.get<Bill[]>(ENDPOINTS.BILLS);
  return Array.isArray(data) ? data : [];
}

async function fetchBillDetails(id: number): Promise<Bill> {
  return apiClient.get<Bill>(ENDPOINTS.BILL_DETAILS(id));
}

async function generateMonthlyBills(thang: number, nam: number): Promise<void> {
  await apiClient.post(`${ENDPOINTS.REPORT_GENERATE_MONTHLY_BILLS}?thang=${thang}&nam=${nam}`, {});
}

export function useBills() {
  return useQuery<Bill[], Error>({
    queryKey: ['bills'],
    queryFn: fetchBills,
  });
}

export function useBillDetails(id: number) {
  return useQuery<Bill, Error>({
    queryKey: ['bills', id],
    queryFn: () => fetchBillDetails(id),
    enabled: !!id,
  });
}

export function useGenerateMonthlyBills() {
  const qc = useQueryClient();
  return useMutation<void, Error, { thang: number; nam: number }>({
    mutationFn: ({ thang, nam }) => generateMonthlyBills(thang, nam),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
