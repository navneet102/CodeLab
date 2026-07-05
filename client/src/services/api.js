import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Room API
export const createRoom = async (roomData) => {
  const { data } = await api.post('/rooms', roomData);
  return data;
};

export const getRoomByCode = async (inviteCode) => {
  const { data } = await api.get(`/rooms/${inviteCode}`);
  return data;
};

export const listRooms = async () => {
  const { data } = await api.get('/rooms');
  return data;
};

// Execution API
export const getExecutionHistory = async (roomId) => {
  const { data } = await api.get(`/execution/${roomId}`);
  return data;
};

export default api;
