import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
});

// Cet intercepteur ajoute le token à CHAQUE requête automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Ou ta méthode de stockage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;