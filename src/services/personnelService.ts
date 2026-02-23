import apiClient from './apiClient';

const getPersonnel = () => {
  return apiClient.get('/personnel');
};

const getPersonnelCount = () => {
  return apiClient.get(`/personnel/count`);
}

const getPersonnelById = (id: string) => {
  return apiClient.get(`/personnel/${id}`);
};

const createPersonnel = (data: any) => {
  return apiClient.post('/personnel', data);
};

const updatePersonnel = (id: string, data: any) => {
  return apiClient.put(`/personnel/${id}`, data);
};

const deletePersonnel = (id: string) => {
  return apiClient.delete(`/personnel/${id}`);
};

export const personnelService = {
  getPersonnel,
  getPersonnelCount,
  getPersonnelById,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
};
