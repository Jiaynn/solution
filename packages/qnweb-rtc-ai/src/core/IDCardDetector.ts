import { QNRTCTrack } from '../types';
import { post } from '../api/_utils';

export interface IDCardDetectorRunParams {
  image: string, // base64编码的图片数据
  session_id?: string, // 唯一会话 id
  ret_image?: boolean, // 是否返回识别后的切图(切图是指精确剪裁对齐后的身份证正反面图片)，返回格式为 JPEG 格式二进制图片使用 base64 编码后的字符串
  ret_portrait?: boolean, // 是否返回身份证(人像面)的人脸图 片，返回格式为 JPEG 格式二进制图片使用 base64 编码后的字符串
  ref_side?: string, // 当图片中同时存在身份证正反面时，通过该参数指定识别的版面:取值'Any' - 识别人像面或国徽面，'F' - 仅 识别人像面，'B' - 仅识别国徽面
  enable_border_check?: string, // 身份证遮挡检测开关，如果输入图片中的身份证卡片边框不完整则返回告警
  enable_detect_copy?: string, // 复印件、翻拍件检测开关，如果输入图片中的身份证卡片是复印件，则返回告警
}

export interface IDCardDetectorRunRes {
  request_id?: string,
  response: {
    session_id: string, // 唯一会话 id
    errorcode: number,	// 返回状态码
    errormsg: string,	// 返回错误消息
    warnmsg: Array<string>, // 多重警告码
    ocr_result: OcrResult,	// 文字识别结果
    image_result: ImageResult,	// 图片检测结果
  }
}

export interface OcrResult {
  side: string	// F-身份证人像面，B-身份 证国徽面
  idno: string, // 身份号码(人像面)
  name: string, //	姓名(人像面)
  nation: string, //	民族(人像面)
  gender: string, //	性别(人像面)
  address: string, //	地址(人像面)
  birthdate: string, //	生日(人像面) eg. "19900111"
  validthru: string, //	有效期(国徽面) eg. "20001010-20101009"
  issuedby: string, //	签发机关(国徽面)

}

export interface ImageResult {
  idcard: string, //	身份证区域图片，使用Base64 编码后的字符串， 是否返回由请求参数ret_image 决定
  portrait: string, //	身份证人像照片，使用Base64 编码后的字符串， 是否返回由请求参数ret_portrait 决定
  idcard_bbox: Array<Array<number>>, //	框坐标，格式为 [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]
}

/**
 * 身份证识别
 */
export class IDCardDetector {
  static run({ _track: videoTrack }: QNRTCTrack, params?: Omit<IDCardDetectorRunParams, 'image'>): Promise<IDCardDetectorRunRes> {
    const base64 = videoTrack.getCurrentFrameDataURL();
    return post<IDCardDetectorRunParams, IDCardDetectorRunRes>(
      '/ocr-idcard',
      {
        image: base64.replace('data:image/png;base64,', ''),
        ...params
      }
    );
  }
}
