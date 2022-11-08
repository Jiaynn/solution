import { QNRTCTrack } from '../types';
import { post } from '../utils';

/**
 * dora接口请求体
 */
interface RequestBody {
  "data.uri": string;
}

/**
 * dora接口响应体
 */
interface ResponseBody {
  request_id: string;
  response: {
    code: number;
    message: string;
    data: Array<{
      line: number; // 文字所在行
      bbox: [number, number][]; // 文本框坐标
      text: string; // 文本内容
      score: number; // 识别置信度
    }>
  }
}

/**
 * 对外响应
 */
export type QNOCRDetectorResult = ResponseBody;


/**
 * ocr识别
 */
export class QNOCRDetector {
  public static run(
    videoTrack: QNRTCTrack
  ): Promise<QNOCRDetectorResult> {
    return post<RequestBody, ResponseBody>(
      '/general-ocr',
      {
        "data.uri": 'data:application/octet-stream;base64,' + videoTrack._track.getCurrentFrameDataURL().split(',')[1]
      }
    )
  }
}
