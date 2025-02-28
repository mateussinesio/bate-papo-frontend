import axios from 'axios';

const API_URL = 'http://localhost:8082/auth';

export const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, { username, password }, { withCredentials: true });
  return response.data;
};

export const register = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/register`, { username, password });
  return response.data;
};

export const logout = async () => {
  await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
};