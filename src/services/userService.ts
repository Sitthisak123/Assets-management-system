import apiClient from './apiClient';

const getUsers = () => {
  return apiClient.get('/users');
};

const getUser = (id: string) => {
  return apiClient.get(`/users/${id}`);
};

export const userService = {
  getUsers,
  getUser,
};
