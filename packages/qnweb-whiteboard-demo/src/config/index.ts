export const configMap: Record<ImportMetaEnv['VITE_NODE_ENV'], {
  request: {
    baseURL: string
  }
}> = {
  dev: {
    request: {
      baseURL: 'http://10.200.20.28:8002',
    }
  },
  staging: {
    request: {
      baseURL: 'http://10.200.20.28:8002'
    }
  },
  prod: {
    request: {
      baseURL: 'https://whiteboard.qiniuapi.com'
    }
  }
};

export const env = import.meta.env.VITE_NODE_ENV || 'dev';

export const requestConfig = configMap[env].request;
