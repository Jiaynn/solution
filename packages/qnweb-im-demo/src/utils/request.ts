const baseURL = process.env.NODE_ENV === 'production' ? 'https://im-test.qiniuapi.com' : '';

export function post<T = any, R = any>(url: string, body?: T): Promise<R> {
  return fetch(baseURL + url, {
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body || {}),
    method: 'POST'
  }).then(response => response.json())
}