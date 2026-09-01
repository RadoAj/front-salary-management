import { jwtDecode } from 'jwt-decode';

import api from './Api.jsx';
const AuthService = {
  async register(username, email, password) {
    try {
      const response = await api.post('auth/register', { username, email, password });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async login(email, password) {
    try {
      const response = await api.post('auth/login', { email, password });
      if (response.data.success) {
        this.setAuthToken(response.data.data.token);
        // Stockez le username si la réponse le contient
        if (response.data.data.username) {
          localStorage.setItem('username', response.data.data.username);
        }
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async logout() {
    try {
      await api.post('auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      delete api.defaults.headers.common.Authorization;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put('auth/user/profile', profileData);
      if (response.data.success) {
        const updatedUser = {
          ...this.getCurrentUser(),
          username: profileData.username,
          email: profileData.email
        };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('auth/user/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async forgotPassword(email) {
    try {
      // Creation nouvelle instance (tsisy intercepteur)
      const tempAxios = api.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await tempAxios.post('auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  isAuthenticated() {
    const token = this.getAuthToken();
    if (!token) return false;

    try {
      const { exp } = jwtDecode(token);
      return exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  getCurrentUser() {
    const token = this.getAuthToken();
    if (!token) {
      console.log("Aucun token trouvé");
      return null;
    }

    try {
      const decoded = jwtDecode(token);
      return {
        ...decoded,
        email: decoded.sub,
        username: decoded.username,
        role: decoded.role
      };
    } catch (error) {
      console.error("Erreur de décodage du token:", error);
      return null;
    }
  },

  setAuthToken(token) {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  },

  getAuthToken() {
    return localStorage.getItem('authToken');
  },

  handleError(error) {
    console.error('AuthService Error:', error);
    return {
      message: error.response?.data?.message || 'Une erreur est survenue',
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

export default AuthService;
