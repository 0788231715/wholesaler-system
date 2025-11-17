import { create } from 'zustand';
import { authAPI } from '../api/auth';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  
  init: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      set({ 
        user: JSON.parse(user), 
        token: token,
        isLoading: false 
      });
      return true;
    }
    set({ isLoading: false });
    return false;
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true });
      console.log('Attempting login with:', { email: credentials.email, passwordLength: credentials.password?.length });
      
      // Clear any existing auth data before attempting login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
      
      const response = await authAPI.login(credentials);
      console.log('Login response success');
      
      const { user, token } = response.data.data;
      
      // Validate response data
      if (!token || !user) {
        throw new Error('Invalid response from server - missing token or user data');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isLoading: false });
      return { success: true, user };
    } catch (error) {
      set({ isLoading: false });
      console.error('Login error:', error.response?.data || error);
      return { 
        success: false, 
        message: error.response?.data?.message || 
                'Login failed. Please check your credentials and try again.' 
      };
    }
  },

  register: async (userData) => {
    try {
      set({ isLoading: true });
      
      // Validate required fields before making the request
      const requiredFields = ['name', 'email', 'password', 'role', 'company'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      console.log('🔄 Making registration request to:', `${import.meta.env.VITE_API_URL}/v1/auth/register`);
      console.log('📝 Registration data:', JSON.stringify(userData, null, 2));

      try {
        const response = await authAPI.register(userData);
        return response;
      } catch (networkError) {
        console.error('Network Error Details:', {
          message: networkError.message,
          code: networkError.code,
          config: {
            url: networkError.config?.url,
            method: networkError.config?.method,
            headers: networkError.config?.headers
          },
          response: networkError.response?.data
        });
        
        // Check if it's a CORS error
        if (networkError.message.includes('Network Error') || !networkError.response) {
          throw new Error('Cannot connect to the server. Please ensure the backend is running at http://localhost:5002');
        }
        
        throw networkError;
      }
      console.log('✅ Registration response:', response.data);
      
      const { user, token } = response.data.data;
      
      if (!user || !token) {
        throw new Error('Invalid response: Missing user or token data');
      }
      
      // Clear any existing data first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Store new authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isLoading: false });
      return { success: true, user };
    } catch (error) {
      console.error('❌ Registration error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      set({ isLoading: false });
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data.message || 'Please check all required fields'
        };
      } else if (error.response?.status === 409) {
        return {
          success: false,
          message: 'This email is already registered'
        };
      } else if (!error.response) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again'
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Registration failed'
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  updateUser: (userData) => {
    const user = { ...get().user, ...userData };
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  isAuthenticated: () => {
    return !!get().token;
  },

  hasRole: (roles) => {
    const user = get().user;
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  }
}));