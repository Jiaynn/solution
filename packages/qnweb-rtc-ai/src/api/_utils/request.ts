import { doraSDKApiURL } from '../../config';
import { store } from '../../store';

/**
 * post 请求封装
 * @param url
 * @param body
 */
export function post<T = any, R = any>(url: string, body?: T): Promise<R> {
  return fetch(doraSDKApiURL + url, {
    headers: {
      Authorization: store.get('token'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      request: body || {},
    }),
    method: 'POST'
  }).then(response => response.json());
}
