import { QNAsrParams, QNAsrResult, QNRTCTrack } from '@/types';
import { WS_URL } from '@/config';
import { store } from '@/store';

export enum AudioToTextAnalyzerStatus {
  AVAILABLE, // 未开始可用
  DESTROY, // 已经销毁不可用
  ERROR, // 连接异常断线
  DETECTING // 正在实时转化
}

/**
 * 语音识别的回调
 */
export interface AudioToTextAnalyzerCallback {
  onStatusChange?: (status: AudioToTextAnalyzerStatus, msg: string) => void,
  onAudioToText?: (result: AudioToTextAnalyzerResult) => void
}

export type AudioToTextAnalyzerParams = Partial<QNAsrParams> | null;
export type AudioToTextAnalyzerResult = QNAsrResult;

export class AudioToTextAnalyzer {
  public status = AudioToTextAnalyzerStatus.AVAILABLE;
  public isRecording = false; // 是否正在识别中
  public ws?: WebSocket | null;
  public audioBufferHandler?: (audioBuffer: AudioBuffer) => void; // audioBuffer监听的回调
  public audioTrack?: QNRTCTrack['_track']; // 音频 Track
  public startTime = Date.now(); // 定义一个初始化的时间
  public leftDataList = [];
  public rightDataList = [];

  /**
   * 发送 EOS close message 到后台；
   * client 保持继续接受消息，所有结果发送完毕后服务端会主动断开连接
   * 主动关闭 WebSocket
   */
  private close() {
    if (!this.ws) {
      throw new Error(`WebSocket is not initialized: ${this.ws}`);
    }
    if (this.status === AudioToTextAnalyzerStatus.DETECTING) {
      this.status = AudioToTextAnalyzerStatus.DESTROY;
      this.ws.close(1000, 'eos');
      setTimeout(() => {
        this.ws.close();
        this.ws = null;
      }, 500);
    }
  }

  /**
   * 建立WebSocket连接
   * @param config
   */
  private initWebSocket(
    config: {
      params: AudioToTextAnalyzerParams,
      audioBuffer: AudioBuffer,
      callback?: AudioToTextAnalyzerCallback
    }
  ) {
    console.log('AudioToTextAnalyzer initWebSocket');

    const { params, callback, audioBuffer } = config;
    const query = {
      aue: 1,
      e: Math.floor(Date.now() / 1000),
      voice_sample: audioBuffer.sampleRate || 16000,
      ...params
    } as QNAsrParams;
    const url = `${WS_URL}?${Object.keys(query).map(key => `${key}=${query[key]}`).join('&')}`;

    Promise.resolve(
      store.cache.signCallback(url)
    ).then(tokenResult => {
      this.ws = new WebSocket(`${url}&token=${tokenResult || null}`);
      this.ws.binaryType = 'arraybuffer';
      this.ws.addEventListener('open', (event) => {
        console.log('AudioToTextAnalyzer open', event);
        this.isRecording = true;
        this.status = AudioToTextAnalyzerStatus.DETECTING;
        if (callback?.onStatusChange) {
          callback.onStatusChange(this.status, '正在实时转化');
        }

        this.ws.addEventListener('message', event => {
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(event.data);
          const result = JSON.parse(text) as AudioToTextAnalyzerResult;
          if (callback?.onAudioToText) {
            callback.onAudioToText(result);
          }
        });
        this.ws.addEventListener('error', (event) => {
          console.log('AudioToTextAnalyzer error', event);
          this.isRecording = false;
          this.status = AudioToTextAnalyzerStatus.ERROR;
          if (callback?.onStatusChange) {
            callback.onStatusChange(this.status, '连接异常断线');
          }
        });
        this.ws.addEventListener('close', (event) => {
          console.log('AudioToTextAnalyzer close', event);
          this.isRecording = false;
          this.status = AudioToTextAnalyzerStatus.DESTROY;
          if (callback?.onStatusChange) {
            callback.onStatusChange(this.status, '已经销毁不可用');
          }
        });
      });
    });
  }

  /**
   * 开始发送消息
   * @param audioBuffer
   */
  private sendMessageToWebSocket(audioBuffer: AudioBuffer) {
    this.leftDataList.push(audioBuffer.getChannelData(0).slice(0));
    if (Date.now() - this.startTime >= 200) {
      const leftData = this.mergeArray(this.leftDataList); // 左通道数据
      const buffer = Int16Array.from(leftData.map(
        x => (x > 0 ? x * 0x7fff : x * 0x8000)
      )).buffer;
      this.ws.send(buffer);
      this.startTime = Date.now();
      this.leftDataList = [];
      this.rightDataList = [];
    }
  }

  /**
   * 合成一个单个Float32Array
   * @param list
   */
  private mergeArray(list: Float32Array[]) {
    const length = list.length * list[0].length;
    const data = new Float32Array(length);
    let offset = 0;
    for (let i = 0; i < list.length; i++) {
      data.set(list[i], offset);
      offset += list[i].length;
    }
    return data;
  }

  /**
   * 交叉合并左右声道的数据
   * @param left
   * @param right
   */
  private interleaveLeftAndRight(left: Float32Array, right: Float32Array) {
    const totalLength = left.length + right.length;
    const data = new Float32Array(totalLength);
    for (let i = 0; i < left.length; i++) {
      const k = i * 2;
      data[k] = left[i];
      data[k + 1] = right[i];
    }
    return data;
  }

  /**
   * 语音识别转文字
   * @param audioTrack
   * @param params
   * @param callback
   */
  static startAudioToText(
    { _track: audioTrack }: QNRTCTrack,
    params: AudioToTextAnalyzerParams,
    callback?: AudioToTextAnalyzerCallback
  ): AudioToTextAnalyzer {
    const client = new this();
    client.startTime = Date.now();
    const handler = (audioBuffer: AudioBuffer) => {
      if (!client.ws) {
        /**
         * 连接空闲, 开始建立连接
         */
        client.initWebSocket({
          params, callback, audioBuffer
        });
      }
      if (client.status === AudioToTextAnalyzerStatus.DETECTING) {
        /**
         * 连接成功开始发送
         */
        client.sendMessageToWebSocket(audioBuffer);
      }
    };
    /**
     * handler回调触发时机为每帧调用一次
     */
    audioTrack.on('audioBuffer', handler);
    client.audioBufferHandler = handler;
    client.audioTrack = audioTrack;
    return client;
  }

  /**
   * 获取当前识别状态
   */
  getStatus() {
    return this.status;
  }

  /**
   * 结束语音识别
   */
  stopAudioToText() {
    if (this.audioTrack && this.audioBufferHandler) {
      this.audioTrack.off('audioBuffer', this.audioBufferHandler);
    }
    if (!this.ws) {
      throw new Error(`ws is ${this.ws}`);
    }
    this.close();
  }
}
