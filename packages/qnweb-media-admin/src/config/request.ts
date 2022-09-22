import { AxiosRequestConfig } from 'axios';

export const axiosRequestConfigMap: Record<ImportMetaEnv['VITE_NODE_ENV'], AxiosRequestConfig> = {
  dev: {
    baseURL: 'http://10.200.20.73:8080',
    timeout: 3000,
  },
  test: {
    baseURL: 'http://10.200.20.73:8080',
    timeout: 3000,
  },
  prod: {
    baseURL: 'https://mam.atlab.ai',
    timeout: 3000,
  },
};
export const axiosRequestConfig = axiosRequestConfigMap[import.meta.env.VITE_NODE_ENV];

export const ssoConfigMap: Record<ImportMetaEnv['VITE_NODE_ENV'], {
  url: string;
}> = {
  dev: {
    url: 'https://sso-dev.qiniu.io'
  },
  test: {
    url: 'https://sso-dev.qiniu.io'
  },
  prod: {
    url: 'https://sso.qiniu.com'
  }
};

export const ssoConfig = ssoConfigMap[import.meta.env.VITE_NODE_ENV];
