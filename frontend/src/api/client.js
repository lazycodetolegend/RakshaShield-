import axios from 'axios';

// Normalize the baseURL to handle both with and without trailing /api
let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');

if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl += '/api';
}

const client = axios.create({
  baseURL: rawBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
