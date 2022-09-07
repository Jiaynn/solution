import {
  DeleteMamAssetsIdParams,
  DeleteMamAssetsIdResult,
  GetMamAssetsIdResultAsrParams,
  GetMamAssetsIdResultAsrResult,
  GetMamAssetsIdResultFacerecParams,
  GetMamAssetsIdResultFacerecResult,
  GetMamAssetsIdResultOcrParams,
  GetMamAssetsIdResultOcrResult,
  GetMamAssetsListParams,
  GetMamAssetsListResult,
  GetMamUploadInfoParams,
  GetMamUploadInfoResult,
  PostMamAssetsIdAiRetryParams,
  PostMamAssetsIdAiRetryResult,
  PostMamUploadSyncParams,
  PostMamUploadSyncResult,
  request
} from '@/api';

export class MamApi {
  /**
   * 获取上传文件信息
   * @param params
   */
  static getUploadInfo(params?: GetMamUploadInfoParams) {
    return request.get<GetMamUploadInfoResult, GetMamUploadInfoResult>('/v1/mam/upload/info', {
      params,
    });
  }

  /**
   * 同步文件信息
   * @param params
   */
  static uploadSync(params: PostMamUploadSyncParams) {
    return request.post<PostMamUploadSyncResult, PostMamUploadSyncResult>('/v1/mam/upload/sync', params);
  }

  /**
   * 资源列表查询
   * @param params
   */
  static getAssetsList(params: GetMamAssetsListParams) {
    return request.get<GetMamAssetsListResult, GetMamAssetsListResult>('/v1/mam/assets/list', {
      params,
    });
  }

  /**
   * 人脸识别查询
   * @param params
   */
  static getFace(params: GetMamAssetsIdResultFacerecParams) {
    return request.get<GetMamAssetsIdResultFacerecResult, GetMamAssetsIdResultFacerecResult>(`/v1/mam/assets/${params._id}/result/facerec`, {
      params
    });
  }

  /**
   * OCR识别查询
   * @param params
   */
  static getOcr(params: GetMamAssetsIdResultOcrParams) {
    return request.get<GetMamAssetsIdResultOcrResult, GetMamAssetsIdResultOcrResult>(`/v1/mam/assets/${params._id}/result/ocr`, {
      params
    });
  }

  /**
   * 语音识别查询
   * @param params
   */
  static getAsr(params: GetMamAssetsIdResultAsrParams) {
    return request.get<GetMamAssetsIdResultAsrResult, GetMamAssetsIdResultAsrResult>(`/v1/mam/assets/${params._id}/result/asr`, {
      params
    });
  }

  /**
   * 删除资源
   * @param params
   */
  static deleteAssetsById(params: DeleteMamAssetsIdParams) {
    return request.delete<DeleteMamAssetsIdResult, DeleteMamAssetsIdResult>(`/v1/mam/assets/${params._id}`, {
      params
    });
  }

  /**
   * 重新识别
   * @param params
   */
  static aiRetry(params: PostMamAssetsIdAiRetryParams) {
    return request.post<PostMamAssetsIdAiRetryResult, PostMamAssetsIdAiRetryResult>(`/v1/mam/assets/${params._id}/ai-retry`, params);
  }
}
