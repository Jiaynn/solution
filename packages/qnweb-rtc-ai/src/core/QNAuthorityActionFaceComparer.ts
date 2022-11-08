import { QNRTCTrack } from '../types';
import {
  FaceActionLiveDetector,
  FaceActionLiveDetectorParams,
  FaceActionLiveDetectorRes
} from './FaceActionLiveDetector';
import {
  QNAuthoritativeFaceComparer,
  QNAuthoritativeFaceParams,
  QNAuthoritativeFaceResult
} from './QNAuthoritativeFaceComparer';

export type QNFaceActionLiveParams = FaceActionLiveDetectorParams;

/**
 * 活体动作识别加权威人脸对比
 */
export class QNAuthorityActionFaceComparer {
  private faceActionLiveDetector: FaceActionLiveDetector;
  private authoritativeFaceParams: QNAuthoritativeFaceParams;
  private videoTrack: QNRTCTrack;

  /**
   * 开始检测
   */
  public static start(
    videoTrack: QNRTCTrack,
    faceActionParams: QNFaceActionLiveParams,
    authoritativeFaceParams: QNAuthoritativeFaceParams
  ) {
    const instance = new this();
    instance.faceActionLiveDetector = FaceActionLiveDetector.start(
      videoTrack,
      faceActionParams
    );
    instance.authoritativeFaceParams = authoritativeFaceParams;
    instance.videoTrack = videoTrack;
    return instance;
  }

  /**
   * 结束检测
   */
  public commit(): Promise<{
    faceActionResult: FaceActionLiveDetectorRes;
    authoritativeFaceResult: QNAuthoritativeFaceResult;
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
