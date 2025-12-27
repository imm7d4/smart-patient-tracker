import api from '../api/axios';

const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await api.post('/profile', profileData);
  return response.data;
};

const profileService = {
  getProfile,
  updateProfile,
};

export default profileService;
