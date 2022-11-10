import { QNAsrParams, QNAsrResult, QNRTCTrack } from '@/types';
import { TranslateWebSocket, ConnectStatus } from '@/utils';

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
  public translateWebSocket?: TranslateWebSocket; // WebSocket
  public isRecording = false; // 是否正在识别中
  private audioBufferHandler?: (audioBuffer: AudioBuffer) => void; // audioBuffer监听的回调
  private audioTrack?: QNRTCTrack['_track']; // 音频 Track
  private startTime = Date.now(); // 定义一个初始化的时间
  private leftDataList = [];
  private rightDataList = [];
  private timeoutWebSocketCloseJob?: NodeJS.Timer;

  /**
   * 建立WebSocket连接
   * @param analyzer
   * @param config
   */
  startConnectWebSocket(
    analyzer: AudioToTextAnalyzer,
    config: {
      params: AudioToTextAnalyzerParams,
      audioBuffer: AudioBuffer,
      callback?: AudioToTextAnalyzerCallback
    }
  ) {
    const { params, callback, audioBuffer } = config;
    const query = {
      aue: 1,
      e: Math.floor(Date.now() / 1000),
      voice_sample: audioBuffer.sampleRate || 16000,
      ...params
    } as QNAsrParams;
    analyzer.translateWebSocket = new TranslateWebSocket({
      query
    }, () => {
      analyzer.isRecording = true;
      analyzer.status = AudioToTextAnalyzerStatus.DETECTING;
      analyzer.translateWebSocket?.on('message', ev => {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(ev.data);
        const result = JSON.parse(text) as AudioToTextAnalyzerResult;
        if (callback?.onAudioToText) {
          callback.onAudioToText(result);
        }

        if (result.isFinal) {
          if (this.timeoutWebSocketCloseJob) {
            clearTimeout(this.timeoutWebSocketCloseJob);
          }
          analyzer.translateWebSocket.close();
        }
      });
      callback?.onStatusChange && callback.onStatusChange(analyzer.status, '正在实时转化');
      analyzer.translateWebSocket?.on('error', () => {
        analyzer.isRecording = false;
        analyzer.status = AudioToTextAnalyzerStatus.ERROR;
        callback?.onStatusChange && callback.onStatusChange(analyzer.status, '连接异常断线');
      });
      analyzer.translateWebSocket?.on('close', () => {
        analyzer.isRecording = false;
        analyzer.status = AudioToTextAnalyzerStatus.DESTROY;
        callback?.onStatusChange && callback.onStatusChange(analyzer.status, '已经销毁不可用');
      });
    });
    analyzer.translateWebSocket.on('open', () => {
      console.log('on open');
      analyzer.isRecording = true;
      analyzer.status = AudioToTextAnalyzerStatus.DETECTING;
      analyzer.translateWebSocket?.on('message', message => {
        callback?.onAudioToText && callback.onAudioToText(JSON.parse(message.data));
      });
      callback?.onStatusChange && callback.onStatusChange(analyzer.status, '正在实时转化');
    });
  }

  /**
   * 开始发送消息
   * @param analyzer
   * @param config
   */
  sendMessageToWebSocket(analyzer: AudioToTextAnalyzer, config: {
    audioBuffer: AudioBuffer
  }) {
    const { audioBuffer } = config;
    analyzer.leftDataList.push(audioBuffer.getChannelData(0).slice(0));
    if (Date.now() - analyzer.startTime >= 200) {
      const leftData = this.mergeArray(analyzer.leftDataList); // 左通道数据
      const buffer = Int16Array.from(leftData.map(
        x => (x > 0 ? x * 0x7fff : x * 0x8000)
      )).buffer;
      analyzer.translateWebSocket?.send(buffer);
      analyzer.startTime = Date.now();
      analyzer.leftDataList = [];
      analyzer.rightDataList = [];
    }
  }

  /**
   * 合成一个单个Float32Array
   * @param list
   */
  mergeArray(list: Float32Array[]) {
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
  interleaveLeftAndRight(left: Float32Array, right: Float32Array) {
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
    const analyzer = new AudioToTextAnalyzer();
    analyzer.startTime = Date.now();
    const handler = (audioBuffer: AudioBuffer) => {
      if (!analyzer.translateWebSocket) {
        /**
         * 连接空闲, 开始建立连接
         */
        analyzer.startConnectWebSocket(analyzer, {
          params, callback, audioBuffer
        });
      }
      if (analyzer.translateWebSocket?.status === ConnectStatus.OPENED) {
        /**
         * 连接成功开始发送
         */
        analyzer.sendMessageToWebSocket(analyzer, {
          audioBuffer
        });
      }
    };
    /**
     * handler回调触发时机为每帧调用一次
     */
    audioTrack.on('audioBuffer', handler);
    analyzer.audioBufferHandler = handler;
    analyzer.audioTrack = audioTrack;
    return analyzer;
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
    this.translateWebSocket?.sendEOS();
    this.timeoutJob();
  }

  /**
   * 超时任务
   * 默认 500 ms 延迟关闭
   * @param ms
   */
  timeoutJob(ms?: number) {
    this.timeoutWebSocketCloseJob = setTimeout(() => {
      this.translateWebSocket?.close();
    }, ms || 500);
  }
}
