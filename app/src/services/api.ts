// API service for DataPortal backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper for API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// ===== USER API =====
export const userAPI = {
  getAll: () => fetchAPI('/users'),
  getById: (id: string) => fetchAPI(`/users/${id}`),
  getByUsername: (username: string) => fetchAPI(`/users/username/${username}`),
  create: (data: any) => fetchAPI('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/users/${id}`, { method: 'DELETE' }),
};

// ===== AUTH API =====
export const authAPI = {
  login: (username: string, password: string) => 
    fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  
  verify2FA: (userId: string, code: string) => 
    fetchAPI('/auth/verify-2fa', { method: 'POST', body: JSON.stringify({ userId, code }) }),
  
  discord: (discordId: string, username: string, email?: string, avatar?: string) => 
    fetchAPI('/auth/discord', { method: 'POST', body: JSON.stringify({ discordId, username, email, avatar }) }),
};

// ===== DOCUMENT API =====
export const documentAPI = {
  getByUser: (userId: string) => fetchAPI(`/documents/user/${userId}`),
  create: (data: any) => fetchAPI('/documents', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/documents/${id}`, { method: 'DELETE' }),
  share: (id: string, username: string) => 
    fetchAPI(`/documents/${id}/share`, { method: 'POST', body: JSON.stringify({ username }) }),
  unshare: (id: string, username: string) => 
    fetchAPI(`/documents/${id}/unshare`, { method: 'POST', body: JSON.stringify({ username }) }),
};

// ===== SETUP API =====
export const setupAPI = {
  seed: () => fetchAPI('/seed', { method: 'POST' }),
  health: () => fetchAPI('/health'),
};
