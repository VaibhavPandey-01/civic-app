import axios from 'axios';
import { useAuthStore } from '../context/useAuthStore';

// base api connection config

// e.g., http192.168.1.503000api
export const API_BASE_URL = 'https://civic-app-3wdi.onrender.com/api';
export const USE_MOCK = false;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const recursivelyNormalizeIds = (obj: any): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(recursivelyNormalizeIds);
  }
  const newObj: any = {};
  for (const key of Object.keys(obj)) {
    if (key === '_id') {
      newObj.id = String(obj._id);
      newObj._id = String(obj._id);
    } else {
      newObj[key] = recursivelyNormalizeIds(obj[key]);
    }
  }
  if (obj._id && !obj.id) {
    newObj.id = String(obj._id);
    newObj._id = String(obj._id);
  }
  return newObj;
};

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = recursivelyNormalizeIds(response.data);
    }
    return response;
  },
  (error) => {

    // check for offlinenetwork issues
    if (!error.response && error.message === 'Network Error') {
      const offlineErr = new Error('No internet connection. Please verify your network settings and try again.');
      return Promise.reject(offlineErr);
    }

    return Promise.reject(error);
  }
);

export default api;
