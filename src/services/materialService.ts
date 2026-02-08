import apiClient from './apiClient';

export interface MaterialType {
  id: number;
  title: string;
}

export interface Material {
  id: number;
  title: string;
  material_type_id: number;
  unit: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  material_type?: MaterialType;
}

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
