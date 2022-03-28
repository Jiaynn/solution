const PREFIX = 'whiteboard info';

/**
 * 自定义 console.info
 * @param key
 * @param data
 * @constructor
 */
export function log(key: string, ...data: any[]): void {
  console.info(`${PREFIX} ${key}`, ...data);
}
