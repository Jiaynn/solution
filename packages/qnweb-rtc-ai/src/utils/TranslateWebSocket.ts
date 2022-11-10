import { store } from '@/store';
import { QNAsrParams } from '@/types';

interface Config {
  baseUrl?: string;
  query: QNAsrParams;
}

interface IEvent {
  event: 'close' | 'error' | 'message' | 'open';
  callback: (event?: any) => unknown;
}

/**
 * WebSocket连接状态
 */
export enum ConnectStatus {
  CLOSED, // 关闭状态
  PROCESSING, // 连接中
  OPENED, // 打开状态
}

/**
 * 语音识别WebSocket类
 */
export class TranslateWebSocket {
  public status: ConnectStatus = ConnectStatus.CLOSED;
  public ws?: WebSocket;
  public listeners: Array<IEvent>;

  constructor(config: Config, initOkCallback?: () => void) {
    const { query, baseUrl = 'wss://ap-open-ws.service-z0.qiniuapp.com/v2/asr' } = config;
    const queryStr = Object.entries(query)
      .filter(arr => arr[1] !== undefined && arr[1] !== null)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    const baseUrlWithParamsStr = baseUrl + '?' + encodeURI(queryStr);
    this.listeners = [];
    this.initWebSocket(baseUrlWithParamsStr, initOkCallback);
  }

  /**
   * 建立socket连接
   * @param url
   * @param initOkCallback
   */
  initWebSocket(url: string, initOkCallback?: () => void) {
    this.status = ConnectStatus.PROCESSING;
    Promise.resolve(
      store.cache.signCallback(url)
    ).then(tokenResult => {
      this.ws = new WebSocket(url + `&token=${tokenResult || null}`);
      this.ws.binaryType = 'arraybuffer';
      this.on('open', () => {
        console.info('roomlog websocket open');
        this.status = ConnectStatus.OPENED;
        initOkCallback && initOkCallback();
      });
      this.on('close', () => {
        console.info('roomlog websocket close');
        this.status = ConnectStatus.CLOSED;
      });
    });
  }

  /**
   * 监听WebSocket的事件
   * @param event
   * @param callback
   */
  on(event: IEvent['event'], callback: IEvent['callback']) {
    this.listeners.push({
      event,
      callback
    });
    this.ws?.addEventListener(event, callback);
  }

  /**
   * 发送数据到服务端
   * @param data
   */
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (this.status === ConnectStatus.OPENED) { // WebSocket连接成功才可以发送数据
      this.ws?.send(data);
    }
  }

  /**
   * 发送字符串 EOS 到后台，后台收到后将所有文本返回，
   * 最后一个json的ended=1表示存储在server的数据发送完毕， client可以安全关闭ws。
   * 此后再发送语音数据后台将不做任何处理。
   */
  sendEOS() {
    if (this.ws && this.status === ConnectStatus.OPENED) {
      this.send('EOS');
    }
  }

  /**
   * 主动关闭 WebSocket
   */
  close() {
    if (this.ws && this.status === ConnectStatus.OPENED) {
      this.status = ConnectStatus.CLOSED;
      this.ws?.close();
    }
  }

  /**
   * 清除给WebSocket绑定的事件
   * 防止内存泄露
   */
  destroy() {
    this.listeners.map(iEvent => {
      const { event, callback } = iEvent;
      this.ws?.removeEventListener(event, callback);
    });
  }
}
