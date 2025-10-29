import apiClient from './apiClient';

export const authService = {
  login: async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  const { user, token } = response.data.data;
  localStorage.setItem('token', token);
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return { user, token };
},


  register: async (userData) => {
    // Map frontend form data to backend expected format
    const backendData = {
      email: userData.email,
      password: userData.password,
      firstName: userData.name.split(' ')[0] || userData.name,
      lastName: userData.name.split(' ').slice(1).join(' ') || '',
      role: userData.role
    };
    
    const response = await apiClient.post('/auth/register', backendData);
    // Extract user and token from your backend response format
    return {
      user: response.data.data.user,
      token: response.data.data.token
    };
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data.data.user;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};