import axios from 'axios';
import { Modal } from 'antd';

import { curEnv } from '@/config';

const requestConfig = {
  dev: {
    baseURL: 'http://10.200.20.73:8080',
    timeout: 3000,
  },
  test: {
    baseURL: 'http://10.200.20.28:5080',
    timeout: 3000,
  },
  prod: {
    baseURL: 'https://niucube-api.qiniu.com',
    timeout: 3000,
  },
};

const request = axios.create(requestConfig[curEnv]);

request.interceptors.request.use((config) => {
  return config;
}, (error) => Promise.reject(error));

// Add a response interceptor
request.interceptors.response.use((response) => {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  const responseCode = response.data.code;
  if (responseCode === 0 || responseCode === 200) {
    return response.data;
  }
  Modal.error({
    content: `${response.data.message}`,
  });
  return Promise.reject(response.data);
}, (error) => {
  Modal.error({
    title: '接口请求出错',
    content: error.message,
  });
  return Promise.reject(error);
});

const mockRequest = <TData>(data: TData): Promise<{
  code: number;
  message: string;
  data: TData;
}> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 0,
        message: 'success',
        data
      });
    }, 1000);
  });
};

export {
  request,
  mockRequest
};
