import { QNRTCTrack } from '@/types';
import { request } from '@/api/_utils';

/**
 * 人脸检测参数
 * @param rotate-人脸检测失败时，是否对图像 A 做旋转再检测，旋转角包 括 90、180、270 三个角度，默认值为 false
 */
export interface FaceDetectorParams {
  rotate?: boolean;
}

/**
 * 人脸检测请求参数
 * @param image_b64-base64编码的图片数据
 */
export type FaceDetectorReqParams = FaceDetectorParams & {
  image_b64: string;
}

/**
 * 人脸检测响应体
 */
export interface FaceDetectorResult {
  request_id: string;
  response: FaceDetectorResData;
}

/**
 * 人脸检测响应值
 * @param num_face int 图像中人脸数量
 * @param rotangle float 图像旋转角度
 * @param face []faceItem [face1,face2,…]，其中 face1,face2,…等为 json 格式，具体格式见下表
 * @param errorcode  int  返回状态码
 * @param errormsg  string  返回错误消息
 */
export interface FaceDetectorResData {
  errorcode: number;
  errormsg: string;
  face: FaceItem[];
  num_face: number;
  rotate_angle: number;
  session_id: string;
}

/**
 * faceItem
 * @param blur  float  人脸模糊度，取值范围[0,1]，越大越清晰
 * @param gender  string  性别，’M’代表男，’F’代表女
 * @param age  int  年龄，区间 1-107 岁
 * @param illumination  float  人脸光照范围，取值范围[0,100]，越大光照质量越好
 * @param facesize  float  人脸尺寸分数，取值分数[0,100]， 越大人脸尺寸越大
 * @param quality  float  人脸综合质量分数，取值范围[0,100], 越大质量越好
 * @param eye  flaot  闭眼概率,取值范围[0,100]
 * @param mouth  float  闭嘴概率,取值范围[0,100]
 * @param pitch  float  三维旋转之俯仰角，[-180,180]
 * @param roll  float  三维旋转之旋转角，[-180,180]
 * @param yaw  float  三维旋转之左右旋转角, [-180,180]
 * @param completeness  int  取值0到100；0表示人脸不完整，溢出了图像边界，100 表示人脸是完整的，在图像边界内
 * @param area  int  人脸区域的大小
 * @param face_aligned_b64  string  使用 base64 编码的对齐后人脸图片数据
 * @param score  float  人脸分数 取值范围 [0,100]
 * @param x  int  人脸框的左上角 x 坐标
 * @param y  int  人脸框的左上角 y 坐标
 * @param width  int  人脸框的宽度
 * @param height  int  人脸框的高度
 * @param face_shape  json  人脸 106 个关键点坐标，包含 face_profile，left_eye, left_eyebrow，right_eye，right_eyebrow，mouth，nose，pupil 等组件，每个组件都是一个 json
 */
export interface FaceItem {
  score: number;
  x: number;
  y: number;
  width: number;
  height: number;
  pitch: number;
  yaw: number;
  roll: number;
  eye: number;
  mouth: number;
  blur: number;
  gender: string;
  age: number;
  illumination: number;
  face_shape: FaceShape;
  completeness: number;
  area: number;
  facesize: number;
  quality: number;
  face_aligned_b64: string;
}

/**
 * @param face_shape  json
 * 人脸 106 个关键点坐标，
 * 包含 face_profile，left_eye, left_eyebrow，right_eye，right_eyebrow，mouth，nose，pupil 等组件
 * 每个组件都是一个 json
 */
export interface FaceShape {
  face_profile: FaceProfile[];
  left_eye: FaceProfile[];
  left_eyebrow: FaceProfile[];
  right_eye: FaceProfile[];
  right_eyebrow: FaceProfile[];
  mouth: FaceProfile[];
  nose: FaceProfile[];
  pupil: FaceProfile[];
}

export interface FaceProfile {
  x: number;
  y: number;
}

/**
 * 人脸检测
 * @param videoTrack
 * @param params
 */
export function faceDetector({ _track: videoTrack }: QNRTCTrack, params?: FaceDetectorParams) {
  const base64 = videoTrack.getCurrentFrameDataURL();
  return request.post<FaceDetectorResult, FaceDetectorResult>('/face-detect', {
    image_b64: base64.replace('data:image/png;base64,', ''),
    ...params
  });
}
