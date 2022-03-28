import { QNRTCTrack } from '../types/QNRTC';
import { post } from '../utils/request';

/**
 * 人脸对比参数
 * @param rotate_A  否  bool  人脸检测失败时，是否对图像 A 做旋转再检测，旋转角包括 90、180、270 三个角度，默认值为 False
 * @param rotate_B  否  bool  人脸检测失败时，是否对图像 B 做旋转再检测，旋转角包括 90、180、270 三个角度，默认值为 False
 * @param maxface_A  否  bool  图像 A 中检测到多张人脸时是否取最大区域的人脸作为输出，默认值为 True
 * @param maxface_B  否  bool  图像 B 中检测到多张人脸时是否取最大区域的人脸作为输出，默认值为 True
 */
export interface FaceComparerParams {
  rotate_A?: boolean;
  rotate_B?: boolean;
  maxface_A?: boolean;
  maxface_B?: boolean;
}

/**
 * 人脸对比请求参数
 * @param data_uri_a  是  string  图片数据 A: base64 编码或 http url
 * @param data_uri_b  是  string  图片数据 B: base64 编码或 http url
 */
export type FaceComparerReqParams = FaceComparerParams & {
  data_uri_a: string;
  data_uri_b: string;
}

/**
 * 人脸对比响应体
 */
export interface FaceComparerRes {
  request_id: string;
  response: FaceComparerResData;
}

/**
 * 人脸对比响应体数据
 */
export interface FaceComparerResData {
  errorcode: number;
  errormsg: string;
  session_id: string;
  similarity: number;
}

/**
 * 人脸识别
 * @param videoTrack
 * @param targetImg
 * @param params
 */
export async function faceComparer({ _track: videoTrack }: QNRTCTrack, targetImg: string, params?: FaceComparerParams) {
  const trackImg = videoTrack.getCurrentFrameDataURL();
  return post<FaceComparerReqParams, FaceComparerRes>('/face-compare', {
    data_uri_a: trackImg,
    data_uri_b: targetImg,
    ...params
  });
}