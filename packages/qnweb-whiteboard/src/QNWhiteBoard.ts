import { version } from './config';
import QNWhiteBoardRoom from './QNWhiteBoardRoom';
import { QNCreateInstanceResult } from './types';

class QNWhiteBoard extends QNWhiteBoardRoom {
  static version = version;

  /**
   * 创建实例
   */
  static create() {
    return new this();
  }

  /**
   * 当没有白板实例时调用则创建一个实例并返回该实例
   * 之后调用均会返回该实例 bucketId 从服务端获取
   * 主要包含 ppt/pdf 事件的一个实例，主要是对 ppt/pdf 状态的管理
   * @param bucketId {string} 桶 ID
   * @param el {string | HTMLElement} 承载白板的容器 id，或者传入 DOM 元素
   */
  createInstance(bucketId: string, el?: string | HTMLElement): QNCreateInstanceResult {
    return this.controller.createInstance(bucketId, el);
  }

  /**
   * 设置白板 iframe 的 src
   * @param path {string} 白板 iframe 的 src
   */
  setBasePath(path: string) {
    return this.controller.setBasePath(path);
  }
}

export default QNWhiteBoard;
