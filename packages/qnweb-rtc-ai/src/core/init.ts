import { store, StoreCache } from '@/store';

/**
 * 全局配置-init初始化
 * @param token
 * @param signCallback
 */
export function init(token: StoreCache['token'], signCallback?: StoreCache['signCallback']) {
  store.set('token', token);
  store.set('signCallback', signCallback);
}
