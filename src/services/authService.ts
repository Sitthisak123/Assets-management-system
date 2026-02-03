import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    email,
    password,
  });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
};

const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // In a real app, you'd decode the token to get user info
    // or make a request to a /me endpoint
    return { token }; 
  }
  return null;
};

export const authService = {
  login,
  logout,
  getCurrentUser,
};
