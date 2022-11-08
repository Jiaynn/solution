import { compressAccurately } from 'image-conversion';

import { post } from '../api/_utils';
import { blobToBase64, dataURLToFile } from '../utils';
import { QNRTCTrack } from '../types';

/**
 * dora接口请求体
 */
interface RequestBody extends QNAuthoritativeFaceParams {
  photo_b64: string; // base64 编码或者 http url 的人脸照片
}

/**
 * dora接口响应体
 */
interface ResponseBody {
  request_id: string; // 请求id
  response: {
    session_id: string; // 会话id
    similarity: number; // 人脸比对相似度。 71大约千分之一误识率，79大约万分之一误识率
    errorcode: number; // 返回状态码
    errormsg: string; // 返回错误消息
  }
}

/**
 * 对外传参
 */
export interface QNAuthoritativeFaceParams {
  realname: string; // 真实名字
  idcard: string; // 身份证号
}

/**
 * 对外响应
 */
export type QNAuthoritativeFaceResult = ResponseBody

/**
 * 权威人脸对比
 * @link https://developer.qiniu.com/dora/6857/face-hdphotoauth
 */
export class QNAuthoritativeFaceComparer {
  public static run(
    videoTrack: QNRTCTrack,
    params: QNAuthoritativeFaceParams,
  ): Promise<QNAuthoritativeFaceResult> {
    const file = dataURLToFile(
      videoTrack._track.getCurrentFrameDataURL(),
      'photo',
    );
    return compressAccurately(file, 24).then(blob => {
      return blobToBase64(blob)
    }).then(base64 => {
      return post<RequestBody, ResponseBody>(
        '/face-hdphotoauth',
        {
          photo_b64: base64.split(',')[1],
          ...params
        }
      )
    });
  }
}

