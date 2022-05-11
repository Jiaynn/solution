import { AuthUrlParams } from '../types/qn-whiteboard';

/**
 * 生成 auth/cbauth 接口 URL 请求地址
 * @param params
 */
export function buildAuthURL(params: AuthUrlParams): string {
  const { baseURL, appId, roomName, suffix } = params;
  return `${baseURL}/v3/apps/${appId}/rooms/${roomName}/${suffix}`;
}

/**
 * { [key: string]: number | string } => { [key: string]: string }
 * @param object
 */
export function makeToStringString(object: Record<string, any>): Record<string, string> {
  return Object.keys(object).reduce((prevObject: Record<string, any>, curKey: string) => {
    prevObject[curKey] = String(object[curKey]);
    return prevObject;
  }, {});
}

export interface UrlOptions {
  queryParams?: {
    [x: string]: any;
  };
  hash?: string;
  path?: string;
  returnAbsoluteUrl?: boolean;
}

export function buildUrl(
  inputUrl?: string | UrlOptions,
  options?: UrlOptions,
) {
  let url: URL;
  let isValidInputUrl = false;

  try {
    url = new URL(inputUrl as string);
  } catch (error) {
    isValidInputUrl = true;

    if (typeof inputUrl === 'string') {
      const host =
        typeof window === 'undefined'
          ? 'http://example.com'
          : window.location.origin;

      url = new URL(`${host}/${inputUrl.replace(/^\/|\/$/g, '')}`);
    } else {
      url =
        typeof window === 'undefined'
          ? new URL('http://example.com')
          : new URL(window.location.href);
    }
  }

  const _options = typeof inputUrl === 'string' ? options : inputUrl;

  if (_options?.queryParams) {
    for (const key in _options.queryParams) {
      if (Object.prototype.hasOwnProperty.call(_options.queryParams, key)) {
        const element = _options.queryParams[key];
        if (!element) {
          url.searchParams.delete(key);
        } else {
          url.searchParams.set(key, element);
        }
      }
    }
  }

  if (_options?.path) {
    url.pathname = _options.path;
  }

  if (_options?.path === null) {
    url.pathname = '';
  }

  if (_options?.hash) {
    url.hash = _options.hash;
  }

  if (isValidInputUrl && !_options?.returnAbsoluteUrl) {
    return url.pathname + url.search + url.hash;
  }

  return url.toString();
}
