import Mock from 'better-mock';

import {
  DeleteMamAssetsIdParams,
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
  PostMamUploadSyncParams,
  mockRequest, MamApi
} from '@/api';

export class MockApi {
  /**
   * 获取上传文件信息
   * @param params
   */
  static getUploadInfo(params?: GetMamUploadInfoParams): Promise<GetMamUploadInfoResult> {
    return mockRequest({
      token: 'Sj2l3BjGqs47X7fxS_JtrBIsyn2StiV1RI8dppqR:kgdr632isv-UIGe77jSoiesZW_g=:eyJzY29wZSI6ImRvcmEtYWkiLCJkZWFkbGluZSI6MTY2MjYyMjA4MH0=',
      bucket: 'dora-ai',
      prefix: 'mam'
    });
  }

  /**
   * 同步文件信息
   * @param params
   */
  static uploadSync(params: PostMamUploadSyncParams) {
    console.log('MockApi.uploadSync', params);
    return MamApi.uploadSync(params);
  }

  /**
   * 资源列表查询
   * @param params
   */
  static getAssetsList(params: GetMamAssetsListParams): Promise<GetMamAssetsListResult> {
    const total = 96;
    const current = Number(params.page_num);
    const pageSize = Number(params.page_size);
    const next = current + 1;
    const last = Math.ceil(total / pageSize);
    const count = current === last ? total % pageSize : pageSize;
    const data: Required<GetMamAssetsListResult>['data'] = Mock.mock({
      total,
      current_page_num: current,
      next_page_num: next,
      page_size: pageSize,
      [`list|${count}`]: [{
        _id: '@id',
        bucket: 'dora-ai',
        key: '@word(10)',
        algos: ['facerec', 'ocr', 'asr'],
        filename: '@word(10)',
        filetype: 'video',
        'file_format|1': ['video/mp4', 'video/avi', 'video/mkv'],
        uploader: '@name',
        'filesize|1024-10000': 1024,
        duration: 1000 * 200,
        'bit_rate|1-1000000': 1,
        'aspect_ratio|1': ['4:3', '2:1', '1:1'],
        'resolution|1': ['1920x1080', '1280x720', '640x480'],
        created_time: Number(Mock.Random.datetime('T')),
        url: '@url',
        cover_url: '@image',
      }]
    });
    return mockRequest(data);
  }

  /**
   * 人脸识别查询
   * @param params
   */
  static getFace(params: GetMamAssetsIdResultFacerecParams): Promise<GetMamAssetsIdResultFacerecResult> {
    const num = 1000;
    const result: Required<GetMamAssetsIdResultFacerecResult>['data'] = Mock.mock({
      'list|20-100': [{
        name: '@cname',
        avatar_url: '@url',
        duration_range_list: [
          [0, num * 10],
          [num * 20, num * 30],
          [num * 40, num * 50],
          [num * 70, num * 90],
          [num * 100, num * 120],
        ],
      }]
    });
    return mockRequest(result);
  }

  /**
   * OCR识别查询
   * @param params
   */
  static getOcr(params: GetMamAssetsIdResultOcrParams): Promise<GetMamAssetsIdResultOcrResult> {
    const result: Required<GetMamAssetsIdResultOcrResult>['data'] = Mock.mock({
      'list|20-100': [{
        text: '@paragraph',
        duration_range: [0, 1000 * 60]
      }]
    });
    return mockRequest(result);
  }

  /**
   * 语音识别查询
   * @param params
   */
  static getAsr(params: GetMamAssetsIdResultAsrParams): Promise<GetMamAssetsIdResultAsrResult> {
    const result: Required<GetMamAssetsIdResultOcrResult>['data'] = Mock.mock({
      'list|20-100': [{
        text: '@paragraph',
        duration_range: [0, 1000 * 60]
      }]
    });
    return mockRequest(result);
  }

  /**
   * 删除资源
   * @param params
   */
  static deleteAssetsById(params: DeleteMamAssetsIdParams) {
    return MamApi.deleteAssetsById(params);
  }

  /**
   * 重新识别
   * @param params
   */
  static aiRetry(params: PostMamAssetsIdAiRetryParams) {
    return MamApi.aiRetry(params);
  }
}
