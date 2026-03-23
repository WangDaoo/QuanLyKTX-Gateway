// Re-export all custom hooks for data fetching
export { useBuildings } from './useBuildings';
export { useRooms, useEmptyRooms } from './useRooms';
export { useStudents } from './useStudents';
export { useBills, useBillDetails, useGenerateMonthlyBills } from './useBills';
export { useContracts } from './useContracts';
export { useDashboard } from './useDashboard';
export {
  useReportOccupancy,
  useReportRevenue,
  useReportDebt,
  useReportElectricityWater,
  useReportViolations,
} from './useReports';
export { useRegistrations, useChangeRequests, useApproveRegistration, useRejectRegistration, useApproveChangeRequest, useRejectChangeRequest } from './useRegistrations';
export { useViolations } from './useViolations';
