// API Client for MongoDB Backend
const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to set token in localStorage
const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove token from localStorage
const removeToken = () => {
  localStorage.removeItem('authToken');
};

// Helper function to get user data from localStorage
const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Helper function to set user data in localStorage
const setUserData = (userData) => {
  localStorage.setItem('userData', JSON.stringify(userData));
};

// Helper function to remove user data from localStorage
const removeUserData = () => {
  localStorage.removeItem('userData');
};

// API Client Class
class APIClient {
  // User Authentication Methods
  
  async register(username, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user data
      setToken(data.token);
      setUserData({
        id: data._id,
        username: data.username,
        email: data.email,
      });

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      setToken(data.token);
      setUserData({
        id: data._id,
        username: data.username,
        email: data.email,
      });

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getUserProfile() {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  logout() {
    removeToken();
    removeUserData();
    window.location.href = '/index.html';
  }

  // Image Management Methods

  async uploadImage(file, description = '', tags = '') {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('image', file);
      if (description) formData.append('description', description);
      if (tags) formData.append('tags', tags);

      const response = await fetch(`${API_BASE_URL}/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async getUserImages() {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/images`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch images');
      }

      return data;
    } catch (error) {
      console.error('Get images error:', error);
      throw error;
    }
  }

  async deleteImage(imageId) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      return data;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  async searchImages(query) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/images/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Search failed');
      }

      return data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // Helper method to check if user is authenticated
  isAuthenticated() {
    return !!getToken();
  }
}

// Create a singleton instance
const apiClient = new APIClient();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { apiClient, getToken, setToken, removeToken, getUserData, setUserData, removeUserData };
}
