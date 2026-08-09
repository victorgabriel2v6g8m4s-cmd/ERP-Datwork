import axios from 'axios';
import { APP_CONFIG } from '../config/app.config.ts';

export const api = axios.create({
  baseURL: APP_CONFIG.api.baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});
