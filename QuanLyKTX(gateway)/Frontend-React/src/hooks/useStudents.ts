// Students CRUD hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../utils/constants';
import type { Student } from '../types/api';

async function fetchStudents(): Promise<Student[]> {
  const data = await apiClient.get<Student[]>(ENDPOINTS.STUDENTS);
  return Array.isArray(data) ? data : [];
}

async function createStudent(payload: Partial<Student>): Promise<void> {
  await apiClient.post(ENDPOINTS.STUDENTS, payload);
}

async function updateStudent(id: number, payload: Partial<Student>): Promise<void> {
  await apiClient.put(ENDPOINTS.STUDENT_BY_ID(id), payload);
}

async function deleteStudent(id: number): Promise<void> {
  await apiClient.delete(ENDPOINTS.STUDENT_BY_ID(id));
}

export function useStudents() {
  return useQuery<Student[], Error>({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation<void, Error, Partial<Student>>({
    mutationFn: createStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number; payload: Partial<Student> }>({
    mutationFn: ({ id, payload }) => updateStudent(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}
