import axios from 'axios';
import secureStorage from '@/utils/secureStorage';
import cryptoService from '@/services/cryptoService';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust if deployed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token AND encrypt body
api.interceptors.request.use(
    (config) => {
      const token = secureStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // Encrypt Payload if data exists and is not FormData (file uploads)
      if (config.data && !(config.data instanceof FormData)) {
        // console.log('Encrypting request data...');
        const encrypted = cryptoService.encrypt(config.data);
        config.data = {payload: encrypted};
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
);

// Add response interceptor to decrypt body
api.interceptors.response.use(
    (response) => {
      if (response.data && response.data.payload) {
        // console.log('Decrypting response data...');
        const decrypted = cryptoService.decrypt(response.data.payload);
        if (decrypted) {
          response.data = decrypted;
        } else {
          console.error('Decryption failed for response');
        }
      }
      return response;
    },
    (error) => {
      // Try to decrypt error response if it has payload (e.g. 400 with encrypted message)
      if (error.response && error.response.data && error.response.data.payload) {
        const decrypted = cryptoService.decrypt(error.response.data.payload);
        if (decrypted) {
          error.response.data = decrypted;
        }
      }
      return Promise.reject(error);
    },
);

export default api;
