import { QNRTCTrack } from '../types/QNRTC';
import { post } from '../utils/request';

/**
 * 光线活体检测请求参数
 */
export interface FaceFlashLiveDetectorReqPrams {
  video_data: { image: string }[];
}

/**
 * 光线活体检测响应体
 */
export interface FaceFlashLiveDetectorRes {
  request_id: string;
  response: FaceFlashLiveDetectorResData;
}

/**
 * 光线活体检测响应值
 */
export interface FaceFlashLiveDetectorResData {
  errorcode: number;
  errormsg: string;
  face_num: number; // 视频中检测到的人脸帧数
  pass_num: number; // 视频中通过的人脸帧数
  score: number; // 活体分数 [0,100]
  session_id: string; // 唯一会话 id
}

/**
 * 光线活体检测
 */
class FaceFlashLiveDetector {

  private frameRate: number;// 帧率
  private videoData: { image: string }[];
  private timer: NodeJS.Timer;

  /**
   * 开始检测
   * @param videoTrack
   * @param defaultFrameRate
   */
  static start(videoTrack: QNRTCTrack, defaultFrameRate?: number) {
    const frameRate = defaultFrameRate || 15;
    const detector = new FaceFlashLiveDetector();
    const track = videoTrack._track;
    detector.frameRate = frameRate;
    detector.videoData = [];
    detector.timer = setInterval(() => {
      const image = track.getCurrentFrameDataURL().replace('data:image/png;base64,', '');
      detector.videoData.push({
        image
      });
    }, 1000 / frameRate);
    return detector;
  }

  /**
   * 响应检测的数据
   */
  async commit() {
    clearInterval(this.timer);
    return post<FaceFlashLiveDetectorReqPrams, FaceFlashLiveDetectorRes>('/face-flashlive', {
      video_data: this.videoData
    });
  }
}

export default FaceFlashLiveDetector;