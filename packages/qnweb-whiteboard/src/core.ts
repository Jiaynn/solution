import { version } from './config';
import { QNWhiteBoardRoom } from './QNWhiteBoardRoom';

export class QNWhiteBoard extends QNWhiteBoardRoom {
  static version = version;

  /**
   * 当没有白板实例时调用则创建一个实例并返回该实例
   * 之后调用均会返回该实例 bucketId 从服务端获取
   * @param bucketId 桶 ID
   */
  createInstance(bucketId: string) {
    return this.controller.createInstance(bucketId);
  }
}
