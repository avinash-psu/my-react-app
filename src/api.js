// api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Adjust this to your server URL

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = token;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const createUser = (userData) => axios.post(`${API_URL}/user`, userData);
export const getTasks = () => axios.get(`${API_URL}/tasks`);
export const createTask = (taskData) => axios.post(`${API_URL}/tasks`, taskData);
export const updateTask = (id, taskData) => axios.put(`${API_URL}/tasks/${id}`, taskData);
export const deleteTask = (id) => axios.delete(`${API_URL}/tasks/${id}`);
