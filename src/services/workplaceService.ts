import type { AxiosResponse } from 'axios';
import apiClient from './apiClient';

export interface Workplace {
  id: number;
  building: string;
  room?: string | null;
  created_at?: string;
  updated_at?: string;
}

const withPathFallback = async <T>(
  primary: () => Promise<AxiosResponse<T>>,
  fallback: () => Promise<AxiosResponse<T>>
): Promise<AxiosResponse<T>> => {
  try {
    return await primary();
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 405) {
      return fallback();
    }
    throw err;
  }
};

const getWorkplaces = async (): Promise<AxiosResponse<Workplace[]>> => {
  return withPathFallback(
    () => apiClient.get<Workplace[]>('/workplaces'),
    () => apiClient.get<Workplace[]>('/workplace')
  );
};

const createWorkplace = async (data: Pick<Workplace, 'building' | 'room'>): Promise<AxiosResponse<Workplace>> => {
  return withPathFallback(
    () => apiClient.post<Workplace>('/workplaces', data),
    () => apiClient.post<Workplace>('/workplace', data)
  );
};

const updateWorkplace = async (
  id: number | string,
  data: Partial<Pick<Workplace, 'building' | 'room'>>
): Promise<AxiosResponse<Workplace>> => {
  return withPathFallback(
    () => apiClient.put<Workplace>(`/workplaces/${id}`, data),
    () => apiClient.put<Workplace>(`/workplace/${id}`, data)
  );
};

const deleteWorkplace = async (id: number | string): Promise<AxiosResponse<void>> => {
  return withPathFallback(
    () => apiClient.delete<void>(`/workplaces/${id}`),
    () => apiClient.delete<void>(`/workplace/${id}`)
  );
};

export const workplaceService = {
  getWorkplaces,
  createWorkplace,
  updateWorkplace,
  deleteWorkplace,
};
