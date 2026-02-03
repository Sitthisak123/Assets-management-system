import apiClient from './apiClient';

const getMaterials = () => {
  return apiClient.get('/materials');
};

const getMaterialById = (id: string) => {
  return apiClient.get(`/materials/${id}`);
};

const createMaterial = (data: any) => {
  return apiClient.post('/materials', data);
};

const updateMaterial = (id: string, data: any) => {
  return apiClient.put(`/materials/${id}`, data);
};

const deleteMaterial = (id: string) => {
  return apiClient.delete(`/materials/${id}`);
};

export const materialService = {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};
