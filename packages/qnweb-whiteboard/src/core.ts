import { version } from './config';
import { QNWhiteBoardRoom } from './QNWhiteBoardRoom';

export class QNWhiteBoard extends QNWhiteBoardRoom {
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
   * @param bucketId 桶 ID
   */
  createInstance(bucketId: string) {
    return this.controller.createInstance(bucketId);
  }
}
