import { doraSDKApiURL } from '../config/request';
import store from '../store';

/**
 * post 请求封装
 * @param url
 * @param body
 */
export function post<T = any, R = any>(url: string, body?: T & { debug?: boolean }): Promise<R> {
  const { debug, ...requestBody } = body;
  const reqBody = debug ? {
    request: requestBody || {},
    debug
  } : {
    request: requestBody || {},
  }
  return fetch(doraSDKApiURL + url, {
    headers: {
      Authorization: store.get('token'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqBody),
    method: 'POST'
  }).then(response => response.json());
}