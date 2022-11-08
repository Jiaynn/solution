import { QNRTCTrack } from '@/types';
import { TranslateWebSocket, ConnectStatus } from '@/utils';

export enum Status {
  AVAILABLE, // 未开始可用
  DESTROY, // 已经销毁不可用
  ERROR, // 连接异常断线
  DETECTING // 正在实时转化
}

/**
 * 语音识别的内容
 */
export interface AudioToText {
  end_seq: number; // 为该文本所在的切片的终点(包含)，否则为-1
  end_time: number; // 该片段的终止时间，毫秒
  ended: number; // 是否是websocket最后一条数据,0:非最后一条数据,1: 最后一条数据。
  finalX: number; // 分片结束,当前消息的transcript为该片段最终结果，否则为partial结果
  long_sil: number; // 是否长时间静音，0:否;1:是
  partial_transcript: string; // partial结果文本, 开启needpartial后返回
  seg_begin: number; // 是否分段开始: 1:是; 0:不是。
  seg_index: number; // 是否是vad分段开始说话的开始1:是分段开始说话; 0:不是。
  spk_begin: number; // 是否是vad分段开始说话的开始1:是分段开始说话; 0:不是。
  start_seq: number; // 该文本所在的切片的起点(包含), 否则为-1
  start_time: number; // 该片段的起始时间，毫秒
  transcript: string; // 语音的文本, 如果final=0, 则为partinal结果 (后面可能会更改),final=1为该片段最终结果
  uuid: string;
  words: WordsDTO; // 返回词语的对齐信息, 参数need_words=1时返回详细内存见下表。
}

export interface WordsDTO {
  seg_end: number; // 该词语相对整个数据流的起始时间, 毫秒
  seg_start: number; // 该词语相对当前分段的起始时间, 毫秒
  voice_end: number; // 该词语相对整个数据流的终止时间, 毫秒
  voice_start: number; // 该词语相对当前分段的终止时间, 毫秒
  word: string; // 词语本身，包括标点符号
}

/**
 * 开启语音识别所需的参数
 */
export interface AudioToTextParams {
  force_final: number; // 是否在text为空的时候返回final信息, 1->强制返回;0->不强制返回。
  maxsil: number; // 最长静音间隔，单位秒，默认10s
  model_type: number; // 0->cn; 默认0
  need_partial: number; // 是否返回partial文本，1->返回，0-> 不返回;默认1
  need_words: number; // 是否返回词语的对齐信息，1->返回， 0->不返回;默认0。
  needvad: number; // 是否需要vad;0->关闭;1->开启; 默认1
  vad_sil_thres: number; // vad断句的累积时间，大于等于0， 如果设置为0，或者没设置，系统默认
  /**
   * 提供热词，格式为: hot_words=热词1,因子1;热词2,因子2，
   * 每个热词由热词本身和方法因子以英文逗号隔开，不同热词通过;隔开，
   * 最多100个热词，每个热词40字节以内。由于潜在的http服务对url大小的限制，以实际支持的热词个数为准
   * 因子范围[-10,10], 正数代表权重权重越高，权重越高越容易识别成这个词，建议设置1 ，负数代表不想识别
   */
  hot_words: string;
}

/**
 * 语音识别的回调
 */
export interface Callback {
  onStatusChange?: (status: Status, msg: string) => void,
  onAudioToText?: (audioToText: AudioToText) => void
}

export const defaultAudioToTextParams = {
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

export class AudioToTextAnalyzer {
  public status = Status.AVAILABLE;
  public ws?: TranslateWebSocket; // WebSocket
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
  startConnectWebSocket(analyzer: AudioToTextAnalyzer, config: {
    params: Partial<AudioToTextParams>,
    audioBuffer: AudioBuffer,
    callback?: Callback
  }) {
    const { params, callback, audioBuffer } = config;
    const query = {
      ...defaultAudioToTextParams,
      voice_sample: audioBuffer.sampleRate,
      ...params
    };
    analyzer.ws = new TranslateWebSocket({
      query
    }, () => {
      analyzer.isRecording = true;
      analyzer.status = Status.DETECTING;
      analyzer.ws?.on('message', message => {
        const msgData = JSON.parse(message.data);
        callback?.onAudioToText && callback.onAudioToText(msgData);
        if (msgData.ended === 1) {
          if (this.timeoutWebSocketCloseJob) {
            clearTimeout(this.timeoutWebSocketCloseJob);
          }
          analyzer.ws?.close();
        }
      });
      callback?.onStatusChange && callback.onStatusChange(analyzer.status, '正在实时转化');
      analyzer.ws?.on('error', () => {
        analyzer.isRecording = false;
        analyzer.status = Status.ERROR;
        callback?.onStatusChange && callback.onStatusChange(analyzer.status, '连接异常断线');
      });
      analyzer.ws?.on('close', () => {
        analyzer.isRecording = false;
        analyzer.status = Status.DESTROY;
        callback?.onStatusChange && callback.onStatusChange(analyzer.status, '已经销毁不可用');
      });
    });
    analyzer.ws.on('open', () => {
      console.log('on open');
      analyzer.isRecording = true;
      analyzer.status = Status.DETECTING;
      analyzer.ws?.on('message', message => {
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
      analyzer.ws?.send(buffer);
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
  static startAudioToText({ _track: audioTrack }: QNRTCTrack, params: Partial<AudioToTextParams>, callback?: Callback): AudioToTextAnalyzer {
    const analyzer = new AudioToTextAnalyzer();
    analyzer.startTime = Date.now();
    const handler = (audioBuffer: AudioBuffer) => {
      console.log('audioBuffer', audioBuffer);
      if (!analyzer.ws) {
        /**
         * 连接空闲, 开始建立连接
         */
        analyzer.startConnectWebSocket(analyzer, {
          params, callback, audioBuffer
        });
      }
      if (analyzer.ws?.status === ConnectStatus.OPENED) {
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
    this.ws?.sendEOS();
    this.timeoutJob();
  }

  /**
   * 超时任务
   * 默认 500 ms 延迟关闭
   * @param ms
   */
  timeoutJob(ms?: number) {
    this.timeoutWebSocketCloseJob = setTimeout(() => {
      this.ws?.close();
    }, ms || 500);
  }
}
