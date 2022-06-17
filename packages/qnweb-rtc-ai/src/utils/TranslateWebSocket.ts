import store from '../store';

interface Query {
  voice_type: number;
  voice_encode: number;
  voice_sample: number;
  needvad: number;
  need_partial: number;
  maxsil: number;
  need_words: number;
  model_type?: number;
  voice_id?: string;
  force_final?: number;
  vad_sil_thres?: number;
  hot_words?: string;
}

export interface Config {
  baseUrl?: string;
  query?: Partial<Query>;
}

interface IEvent {
  event: 'close' | 'error' | 'message' | 'open';
  callback: (event?: any) => unknown;
}

const defaultQuery = {
  voice_type: 1, // 数据格式，1->pcm(wav);默认1
  voice_encode: 1, // 数据编码格式，1->s16le; 默认1
  voice_sample: 16000, // 数据采样率;默认16000
  needvad: 1, // 是否需要vad;0->关闭;1->开启; 默认1
  need_partial: 1, // 是否返回partial文本，1->返回，0-> 不返回;默认1
  maxsil: 10, // 最长静音间隔，单位秒，默认10s
  need_words: 0, // 是否返回词语的对齐信息，1->返回， 0->不返回;默认0。 以字段words返回，列表格式。
  // 以下为非必选参数
  model_type: 0, // 0->cn; 默认0
  voice_id: undefined, // 数据流id，不同流不同
  force_final: 0, // 是否在text为空的时候返回final信息, 1->强制返回;0->不强制返回。 默认情况下，如果text为空， 不会返回final信息。
  vad_sil_thres: 0.5 // vad断句的累积时间，大于等于0， 如果设置为0，或者没设置，系统默认
};

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
class TranslateWebSocket {
  public status: ConnectStatus = ConnectStatus.CLOSED;
  public ws?: WebSocket;
  public listeners: Array<IEvent>;

  constructor(config: Config, initOkCallback?: () => void) {
    const { query = defaultQuery, baseUrl = 'wss://wz-rt-asr.service-z0.qiniuapp.com/asr' } = config;
    const queryStr = Object.entries({
      ...defaultQuery,
      ...query,
      e: Math.floor(Date.now() / 1000)
    })
      .filter(arr => arr[1] !== undefined && arr[1] !== null)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    const baseUrlWithParamsStr = baseUrl + '?' + encodeURI(queryStr);
    // const SKSign = HmacSHA1(baseUrlWithParamsStr, secretKey);
    // const SKEncodedSign = Base64.stringify(SKSign).replace(/\//g, '_').replace(/\+/g, '-');
    // const token = `${accessKey}:${SKEncodedSign}`;
    // const realConnectUrl = `${baseUrlWithParamsStr}&token=${token}`;
    this.listeners = [];
    this.initWebSocket(baseUrlWithParamsStr, initOkCallback);
  }

  /**
   * 建立socket连接
   * @param url
   * @param initOkCallback
   */
  async initWebSocket(url: string, initOkCallback?: () => void) {
    this.status = ConnectStatus.PROCESSING;
    const token = store.cache.signCallback ? (await store.cache.signCallback(url)) : null;
    this.ws = new WebSocket(url + `&token=${token}`);
    this.on('open', () => {
      console.info('roomlog websocket open');
      this.status = ConnectStatus.OPENED;
      initOkCallback && initOkCallback();
    });
    this.on('close', () => {
      console.info('roomlog websocket close');
      this.status = ConnectStatus.CLOSED;
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

export default TranslateWebSocket;
