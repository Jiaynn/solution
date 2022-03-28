/**
 * 动态添加脚本
 * @param url
 * @param isModule
 */
export function addScript(url: string, isModule?: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    if (isModule) {
      script.type = 'module';
    }
    document.documentElement.appendChild(script);
    script.onload = function() {
      resolve();
    };
    script.onerror = function() {
      reject();
    };
  });
}