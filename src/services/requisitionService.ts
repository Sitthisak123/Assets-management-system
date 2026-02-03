import apiClient from './apiClient';

const getRequisitions = () => {
  return apiClient.get('/requisitions');
};

const getRequisitionById = (id: string) => {
  return apiClient.get(`/requisitions/${id}`);
};

const createRequisition = (data: any) => {
  return apiClient.post('/requisitions', data);
};

const updateRequisition = (id: string, data: any) => {
  return apiClient.put(`/requisitions/${id}`, data);
};

const deleteRequisition = (id: string) => {
  return apiClient.delete(`/requisitions/${id}`);
};

export const requisitionService = {
  getRequisitions,
  getRequisitionById,
  createRequisition,
  updateRequisition,
  deleteRequisition,
};
