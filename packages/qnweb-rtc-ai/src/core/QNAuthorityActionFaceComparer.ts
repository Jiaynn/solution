import { QNFaceActliveSessionParams, QNFaceActliveSessionResult, QNRTCTrack } from '@/types';
import {
  FaceActionLiveDetector,
  FaceActionLiveDetectorParams,
  FaceActionLiveDetectorResult
} from './FaceActionLiveDetector';
import {
  QNAuthoritativeFaceComparer,
  QNAuthoritativeFaceParams,
  QNAuthoritativeFaceComparerResult
} from './QNAuthoritativeFaceComparer';
import { request } from '@/api/_utils';

/**
 * 活体动作识别加权威人脸对比
 */
export class QNAuthorityActionFaceComparer {
  private faceActionLiveDetector: FaceActionLiveDetector;
  private authoritativeFaceParams: QNAuthoritativeFaceParams;
  private videoTrack: QNRTCTrack;

  /**
   * 创建实例
   */
  static create(): QNAuthorityActionFaceComparer {
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
   * 开始检测
   */
  start(
    videoTrack: QNRTCTrack,
    faceActionParams: FaceActionLiveDetectorParams,
    authoritativeFaceParams: QNAuthoritativeFaceParams
  ): QNAuthorityActionFaceComparer {
    const faceActionLiveDetector = FaceActionLiveDetector.create();
    this.faceActionLiveDetector = faceActionLiveDetector.start(
      videoTrack,
      faceActionParams
    );
    this.authoritativeFaceParams = authoritativeFaceParams;
    this.videoTrack = videoTrack;
    return this;
  }

  /**
   * 结束检测
   */
  public commit(): Promise<{
    faceActionResult: FaceActionLiveDetectorResult;
    authoritativeFaceResult: QNAuthoritativeFaceComparerResult;
  }> {
    return Promise.all([
      this.faceActionLiveDetector.commit(),
      QNAuthoritativeFaceComparer.run(
        this.videoTrack,
        this.authoritativeFaceParams
      )
    ]).then(([faceActionResult, authoritativeFaceResult]) => {
      return {
        faceActionResult,
        authoritativeFaceResult
      };
    });
  }
}
