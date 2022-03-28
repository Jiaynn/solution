import { isPreloadSupported } from './support';

/**
 * 异步加载 script 脚本
 * @param element
 * @param url
 * @param isModule
 */
export function addScript(element: HTMLElement, url: string, isModule?: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    if (isModule) {
      script.type = 'module';
    }
    element.appendChild(script);
    script.onload = function() {
      resolve();
    };
    script.onerror = function() {
      reject();
    };
  });
}

/**
 * 预加载资源
 * @param url
 * @param type
 * @param crossOrigin
 */
export function preloadResource(url: string, type: HTMLLinkElement['as'], crossOrigin: boolean): void {
  if (!isPreloadSupported()) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = type;
  if (crossOrigin) link.crossOrigin = 'anonymous';
  link.href = url;
  document.head.appendChild(link);
}