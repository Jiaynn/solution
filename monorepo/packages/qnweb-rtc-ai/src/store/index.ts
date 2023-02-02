export interface StoreCache {
  token: string | null,
  signCallback?: (url: string) => Promise<string>
}

class Store {
  public cache: StoreCache;

  constructor() {
    this.cache = {
      token: null
    };
  }

  /**
   * 获取缓存
   * @param key
   */
  get(key: keyof StoreCache): any {
    return this.cache[key];
  }

  /**
   * 设置缓存
   * @param key
   * @param value
   */
  set(key: keyof StoreCache, value: any): void {
    this.cache[key] = value;
  }
}

export const store = new Store();
