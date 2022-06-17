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
   * 内部方法
   * 可以自定义设置
   * @param key
   * @param value
   */
  setConfig(key: keyof QNWhiteBoard, value: string) {
    this[key] = value;
  }

  /**
   * 当没有白板实例时调用则创建一个实例并返回该实例
   * 之后调用均会返回该实例 bucketId 从服务端获取
   * 主要包含 ppt/pdf 事件的一个实例，主要是对 ppt/pdf 状态的管理
   * @param bucketId {string} 桶 ID
   * @param el {string | HTMLElement} 承载白板的容器 id，或者传入 DOM 元素
   */
  createInstance(bucketId?: string, el?: string | HTMLElement): QNCreateInstanceResult {
    return this.controller.createInstance(bucketId, el);
  }

  /**
   * 初始化打开白板所需的参数
   * params 包含以下属性
   * | 参数        | 类型                    | 描述                                                         |
   * | ----------- | ----------------------- | ------------------------------------------------------------ |
   * | path        | String                  | 白板 iframe 的 src                                           |
   * | el          | String <br> HTMLElement | 承载白板 iframe 的容器，传 DOM 元素 id 或元素本身，默认传递'iframeBox' |
   * | playbackUrl | String                  | 回放模块请求地址                                             |
   * @param params
   */
  initConfig(params: {
    path?: string;
    el?: string | HTMLElement;
    playbackUrl?: string;
  }) {
    return this.controller.initConfig({
      playbackUrl: 'https://sdk.efaceboard.cn:8888/Chatboard/meeting/getRecord',
      ...params
    });
  }
}

export default QNWhiteBoard;
