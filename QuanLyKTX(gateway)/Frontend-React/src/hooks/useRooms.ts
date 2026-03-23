// Rooms CRUD hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../utils/constants';
import type { Room } from '../types/api';

async function fetchRooms(): Promise<Room[]> {
  const data = await apiClient.get<Room[]>(ENDPOINTS.ROOMS);
  return Array.isArray(data) ? data : [];
}

async function fetchEmptyRooms(): Promise<Room[]> {
  const data = await apiClient.get<Room[]>(ENDPOINTS.ROOMS_EMPTY);
  return Array.isArray(data) ? data : [];
}

async function createRoom(payload: Omit<Room, 'maPhong' | 'trangThai'>): Promise<void> {
  await apiClient.post(ENDPOINTS.ROOMS, payload);
}

async function updateRoom(id: number, payload: Partial<Room>): Promise<void> {
  await apiClient.put(ENDPOINTS.ROOM_BY_ID(id), payload);
}

async function deleteRoom(id: number): Promise<void> {
  await apiClient.delete(ENDPOINTS.ROOM_BY_ID(id));
}

export function useRooms() {
  return useQuery<Room[], Error>({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
  });
}

export function useEmptyRooms() {
  return useQuery<Room[], Error>({
    queryKey: ['rooms', 'empty'],
    queryFn: fetchEmptyRooms,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation<void, Error, Omit<Room, 'maPhong' | 'trangThai'>>({
    mutationFn: createRoom,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number; payload: Partial<Room> }>({
    mutationFn: ({ id, payload }) => updateRoom(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteRoom,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}
