import type { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import type { User } from './userService';

export type Personnel = User;

const isPersonnelRole = (user: User) => user.status !== -1;

const getPersonnel = async (): Promise<AxiosResponse<Personnel[]>> => {
  const response = await apiClient.get<User[]>('/users');
  const filtered = (response.data || []).filter(isPersonnelRole);
  return { ...response, data: filtered };
};

const getPersonnelCount = async (): Promise<{ data: { count: number } }> => {
  const response = await getPersonnel();
  return { data: { count: response.data.length } };
};

const getPersonnelById = async (id: string) => {
  const response = await apiClient.get<Personnel>(`/users/${id}`);
  return response;
};

const createPersonnel = (data: Partial<Personnel>) => {
  return apiClient.post<Personnel>('/users', {
    ...data,
    role: -1,
    status: data.status ?? 1,
    username: data.username || undefined,
    email: data.email || undefined,
    display_name: data.display_name || undefined,
    workplace_id: data.workplace_id ?? null,
  });
};

const updatePersonnel = (id: string, data: Partial<Personnel>) => {
  return apiClient.put<Personnel>(`/users/${id}`, {
    ...data,
    role: -1,
  });
};

const deletePersonnel = (id: string) => {
  return apiClient.delete(`/users/${id}`);
};

const getPersonnelByStatus = async (status: number): Promise<AxiosResponse<Personnel[]>> => {
  const response = await getPersonnel();
  const filtered = response.data.filter((item) => item.status === status);
  return { ...response, data: filtered };
};

export const personnelService = {
  getPersonnel,
  getPersonnelCount,
  getPersonnelById,
  getPersonnelByStatus,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
};
