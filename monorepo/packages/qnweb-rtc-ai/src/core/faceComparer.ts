import { compress, dataURLtoFile, filetoDataURL } from 'image-conversion';

import { QNFaceCompareParams, QNFaceCompareResult, QNRTCTrack } from '@/types';
import { request } from '@/api/_utils';

export type FaceComparerParams = QNFaceCompareParams & {
  /**
   * 压缩的宽
   */
  captureWidth?: number;
  /**
   * 压缩的高
   */
  captureHeight?: number;
  /**
   * 压缩质量
   */
  captureQuality?: number;
}
export type FaceComparerResult = QNFaceCompareResult;

/**
 * 人脸比对
 * @param videoTrack
 * @param params
 */
export function faceComparer(
  { _track: videoTrack }: QNRTCTrack,
  params: FaceComparerParams
): Promise<FaceComparerResult> {
  const {
    captureWidth = 240, captureHeight = 320, captureQuality = 90,
    ...restParams
  } = params || {};
  const base64 = videoTrack.getCurrentFrameDataURL();
  return dataURLtoFile(base64).then(fileResult => {
    return compress(fileResult, {
      width: captureWidth,
      height: captureHeight,
      quality: captureQuality,
    });
  }).then(blobResult => {
    return filetoDataURL(blobResult);
  }).then(dataURLResult => {
    return request.post<FaceComparerResult, FaceComparerResult>('/face-compare-v2', [
      {
        image: dataURLResult.replace(/^data:image\/\w+;base64,/, ''),
        image_type: 'BASE64',
        face_type: 'LIVE',
      },
      restParams
    ]);
  });
}
