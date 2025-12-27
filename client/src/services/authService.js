import api from '../api/axios';

import secureStorage from '../utils/secureStorage';

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.data.token) {
    secureStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  if (response.data.data.token) {
    secureStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

const logout = () => {
  secureStorage.removeItem('token');
};

export default {
  register,
  login,
  logout,
};
