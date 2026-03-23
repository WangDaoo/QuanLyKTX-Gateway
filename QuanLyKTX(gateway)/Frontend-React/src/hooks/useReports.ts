// Reports data hooks
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../utils/constants';
import type {
  ReportOccupancy,
  ReportRevenue,
  ReportDebt,
  ReportElectricityWater,
  ReportViolation,
} from '../types/api';

export function useReportOccupancy(thang: number, nam: number) {
  return useQuery<ReportOccupancy[], Error>({
    queryKey: ['reports', 'occupancy', thang, nam],
    queryFn: () =>
      apiClient.get<ReportOccupancy[]>(ENDPOINTS.REPORT_OCCUPANCY_RATE, { thang, nam }).then(
        (d) => (Array.isArray(d) ? d : [])
      ),
  });
}

export function useReportRevenue(thang: number, nam: number) {
  return useQuery<ReportRevenue[], Error>({
    queryKey: ['reports', 'revenue', thang, nam],
    queryFn: () =>
      apiClient.get<ReportRevenue[]>(ENDPOINTS.REPORT_REVENUE, { thang, nam }).then(
        (d) => (Array.isArray(d) ? d : [])
      ),
  });
}

export function useReportDebt(thang: number, nam: number) {
  return useQuery<ReportDebt[], Error>({
    queryKey: ['reports', 'debt', thang, nam],
    queryFn: () =>
      apiClient.get<ReportDebt[]>(ENDPOINTS.REPORT_DEBT, { thang, nam }).then(
        (d) => (Array.isArray(d) ? d : [])
      ),
  });
}

export function useReportElectricityWater(thang: number, nam: number) {
  return useQuery<ReportElectricityWater[], Error>({
    queryKey: ['reports', 'electricity-water', thang, nam],
    queryFn: () =>
      apiClient
        .get<ReportElectricityWater[]>(ENDPOINTS.REPORT_ELECTRICITY_WATER, { thang, nam })
        .then((d) => (Array.isArray(d) ? d : [])),
  });
}

export function useReportViolations(nam: number) {
  return useQuery<ReportViolation[], Error>({
    queryKey: ['reports', 'violations', nam],
    queryFn: () =>
      apiClient.get<ReportViolation[]>(ENDPOINTS.REPORT_VIOLATIONS, { nam }).then(
        (d) => (Array.isArray(d) ? d : [])
      ),
  });
}
