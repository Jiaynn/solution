import RecordRTC from 'recordrtc';

import {
  QNFaceActliveParams,
  QNFaceActliveResult,
  QNFaceActliveSessionParams,
  QNFaceActliveSessionResult,
  QNRTCTrack
} from '@/types';
import { blobToDataURI } from '@/utils';
import { request } from '@/api/_utils';

export type FaceActionLiveDetectorParams = Omit<QNFaceActliveParams, 'video_base64'> & {
  /**
   * 采集质量控制 - 视频宽
   */
  encodeWidth?: number;
  /**
   * 采集质量控制 - 视频高
   */
  encodeHeight?: number;
  /**
   * 采集质量控制 - 码率 码率越高识别结果越准确同时请求相应时间变长
   */
  encodeBitRate?: number;
  /**
   * 采集质量控制 - 帧率
   */
  encodeFPS?: number;
};
export type FaceActionLiveDetectorResult = QNFaceActliveResult;

/**
 * 动作活体检测
 */
export class FaceActionLiveDetector {
  private recorder: RecordRTC;
  private params: Omit<QNFaceActliveParams, 'video_base64'>;

  /**
   * 创建动作活体检测
   */
  static create(): FaceActionLiveDetector {
    return new this();
  }

  /**
   * 获取校验码
   * @param params
   */
  public getRequestCode(
    params?: QNFaceActliveSessionParams
  ): Promise<QNFaceActliveSessionResult> {
    return request.post<QNFaceActliveSessionResult, QNFaceActliveSessionResult>('/face-actlive-session', params || {});
  }

  /**
   * 开始录制
   * @param videoTrack
   * @param params
   */
  start(
    videoTrack: QNRTCTrack,
    params?: FaceActionLiveDetectorParams
  ): FaceActionLiveDetector {
    const {
      encodeWidth = 640, encodeHeight = 480, encodeBitRate = 180 * 1000, encodeFPS = 15,
      ...restParams
    } = params || {};
    this.params = restParams;

    const stream = new MediaStream([videoTrack._track.mediaTrack]);
    this.recorder = new RecordRTC(stream, {
      type: 'video',
      mimeType: 'video/mp4',
      timeSlice: 200,
      canvas: {
        width: encodeWidth,
        height: encodeHeight,
      },
      bitrate: encodeBitRate,
      frameRate: encodeFPS
    });
    this.recorder.startRecording();
    return this;
  }

  /**
   * 提交录制
   */
  commit(): Promise<FaceActionLiveDetectorResult> {
    return new Promise<Blob>(resolve => {
      this.recorder.stopRecording(() => {
        resolve(this.recorder.getBlob());
      });
    }).then((blobResult) => {
      return blobToDataURI(blobResult).then((base64Result) => {
        console.log('base64Result', base64Result);
        return base64Result.replace(`data:${blobResult.type};base64,`, '');
      });
    }).then(video_base64 => {
      return request.post<FaceActionLiveDetectorResult, FaceActionLiveDetectorResult>('/face-actlive-v2', {
        video_base64,
        ...this.params
      });
    });
  }
}
