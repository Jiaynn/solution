import './qnweb-rtc-4.0.1-beta.7.umd';

import { QNRTCTrack } from '@/types';
import { blobToDataURI } from '@/utils';
import { request } from '@/api/_utils';

/**
 * 动作的标示字符串
 */
export enum ActionType {
  Nod = 'nod',
  Shake = 'shake',
  Blink = 'blink',
  Mouth = 'mouth'
}

/**
 * 动作活体检测参数
 */
export interface FaceActionLiveDetectorParams {
  action_types: ActionType[];
  video_type?: VideoType; // 选择录制的格式
  debug?: boolean; // 是否开启 debug，开启 debug 的记录目前会在数据库里面保存 12 小时
}

/**
 * 视频格式，1 表示 mp4, 2 表示 h264，默认值为 1
 */
export enum VideoType {
  Mp4 = 1,
  H264
}

/**
 * 动作活体检测请求参数
 */
export type FaceActionLiveDetectorReqParams = {
  video_b64: string;
} & FaceActionLiveDetectorParams;

/**
 * 动作活体检测响应体
 */
export interface FaceActionLiveDetectorResult {
  request_id: string;
  response: FaceActionLiveResData;
}

/**
 * 动作活体检测响应值
 */
export interface FaceActionLiveResData {
  best_frames: BestFrame[]; // 最优帧列表，列表中每个元素格式是 json，包括 base64 编码的二进制图片数据和图像质量分数
  errorcode: number;
  errormsg: string;
  live_status: number; // 返回动作活体状态码，1 表示通过，0 表示不通过
  session_id: string; // 唯一会话 id
}

/**
 * 最优帧列表，列表中每个元素格式是 json，
 * 包括 base64 编码的二进制图片数据和图像质量分数
 */
export interface BestFrame {
  image_b64: string; // base64 编码的二进制图像数据
  quality: number; // 图像质量分数, 取值范围是[0,100]
}

/**
 * 动作活体检测
 */
export class FaceActionLiveDetector {
  private recorder: any;
  private params: FaceActionLiveDetectorParams;
  private video_type: VideoType;

  /**
   * 开始录制
   * @param videoTrack
   * @param params
   */
  static start(videoTrack: QNRTCTrack, params: FaceActionLiveDetectorParams) {
    const detector = new FaceActionLiveDetector();
    const recorder = QNRTC.default.createMediaRecorder();
    const mimeTypeMap = {
      [VideoType.Mp4]: 'video/mp4',
      [VideoType.H264]: 'video/webm;codecs=h264'
    };
    recorder.constructor.recorderTimeslice = 200;
    recorder.setMimeType(mimeTypeMap[detector.video_type]);
    detector.recorder = recorder;
    detector.recorder.start({ videoTrack });
    detector.params = params;
    return detector;
  }

  /**
   * 提交录制
   */
  async commit(): Promise<FaceActionLiveDetectorResult> {
    const recordBlob = this.recorder.stop();
    const videoB64 = await blobToDataURI(recordBlob);
    const word = 'base64,';
    const index = videoB64.indexOf(word) + word.length;
    const video_b64 = videoB64.slice(index);
    return request.post<FaceActionLiveDetectorResult, FaceActionLiveDetectorResult>('/face-actlive', {
      video_b64,
      ...this.params
    });
  }
}
