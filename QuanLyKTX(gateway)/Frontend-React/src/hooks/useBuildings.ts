// Buildings CRUD hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../utils/constants';
import type { Building } from '../types/api';

async function fetchBuildings(): Promise<Building[]> {
  const data = await apiClient.get<Building[]>(ENDPOINTS.BUILDINGS);
  return Array.isArray(data) ? data : [];
}

async function createBuilding(payload: Omit<Building, 'maToaNha'>): Promise<void> {
  await apiClient.post(ENDPOINTS.BUILDINGS, payload);
}

async function updateBuilding(id: number, payload: Partial<Building>): Promise<void> {
  await apiClient.put(ENDPOINTS.BUILDING_BY_ID(id), payload);
}

async function deleteBuilding(id: number): Promise<void> {
  await apiClient.delete(ENDPOINTS.BUILDING_BY_ID(id));
}

export function useBuildings() {
  return useQuery<Building[], Error>({
    queryKey: ['buildings'],
    queryFn: fetchBuildings,
  });
}

export function useCreateBuilding() {
  const qc = useQueryClient();
  return useMutation<void, Error, Omit<Building, 'maToaNha'>>({
    mutationFn: createBuilding,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['buildings'] }),
  });
}

export function useUpdateBuilding() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number; payload: Partial<Building> }>({
    mutationFn: ({ id, payload }) => updateBuilding(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['buildings'] }),
  });
}

export function useDeleteBuilding() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteBuilding,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['buildings'] }),
  });
}
