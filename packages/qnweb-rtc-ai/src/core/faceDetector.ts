import { QNFaceDetectParams, QNFaceDetectResult, QNRTCTrack } from '@/types';
import { compress, dataURLtoFile, filetoDataURL } from 'image-conversion';
import { request } from '@/api/_utils';

type FaceDetectorParams = Omit<QNFaceDetectParams, 'image' | 'image_type' | 'face_type'> & {
  captureWidth?: number;
  captureHeight?: number;
  captureQuality?: number;
}
type FaceDetectorResult = QNFaceDetectResult;

/**
 * 人脸检测
 * @param videoTrack
 * @param params
 */
export function faceDetector(
  { _track: videoTrack }: QNRTCTrack,
  params?: FaceDetectorParams
): Promise<FaceDetectorResult> {
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
    return request.post<FaceDetectorResult, FaceDetectorResult>('/face-detect-v2', {
      image: dataURLResult.replace(/^data:image\/\w+;base64,/, ''),
      image_type: 'BASE64',
      face_type: 'LIVE',
      ...restParams
    });
  });
}
