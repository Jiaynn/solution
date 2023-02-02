/**
 * 在不支持 preload 的浏览器环境中，会忽略对应的 link 标签，而若需要做特征检测的话，则：
 */
export function isPreloadSupported(): boolean {
  const link = document.createElement('link');
  const relList = link.relList;
  if (!relList || !relList.supports) {
    return false;
  }
  return relList.supports('preload');
}