import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 8000
});

const data = (request) => request.then((response) => response.data.data);

export const getSummary = () => data(api.get('/api/analytics/summary'));
export const getSessions = () => data(api.get('/api/sessions'));
export const getSessionEvents = (sessionId) =>
  data(api.get(`/api/sessions/${encodeURIComponent(sessionId)}/events`));
export const getPages = () => data(api.get('/api/pages'));
export const getHeatmap = (pageUrl) =>
  data(api.get('/api/heatmap', { params: { pageUrl } }));
