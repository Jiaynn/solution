import axios from 'axios';

import { BASE_URL } from '@/config';
import { store } from '@/store';

const request = axios.create({
  baseURL: BASE_URL
});

request.interceptors.request.use(function (config) {
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: store.get('token'),
      'Content-Type': 'application/json'
    }
  };
}, error => {
  return Promise.reject(error);
});

request.interceptors.response.use(response => {
  return response.data;
}, error => {
  return Promise.reject(error);
});

export {
  request
};
