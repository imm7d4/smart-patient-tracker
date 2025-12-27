import {createContext, useState, useEffect} from 'react';
import authService from '../services/authService';
import secureStorage from '../utils/secureStorage';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = secureStorage.getItem('token');
    const storedUser = secureStorage.getItem('user');
    if (token && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    try {
      const res = await authService.login(userData);
      console.log('Login response:', res);

      // authService.login returns response.data which is already decrypted
      // response.data has structure: { success: true, data: { token, ...userFields } }
      const {data} = res; // This is the user data with token
      console.log('User data:', data);

      setUser(data);
      secureStorage.setItem('user', data);
      secureStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const {data} = res;

    setUser(data);
    secureStorage.setItem('user', data);
    secureStorage.setItem('token', data.token);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    secureStorage.removeItem('user');
    secureStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{user, loading, login, register, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
