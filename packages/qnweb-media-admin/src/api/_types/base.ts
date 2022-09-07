/* prettier-ignore-start */
/* tslint:disable */
/* eslint-disable */

/* 该文件由 yapi-to-typescript 自动生成，请勿直接修改！！！ */

// @ts-ignore
type FileData = File

/**
 * 接口 [获取上传文件信息↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3111) 的 **请求类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `GET /v1/mam/upload/info`
 * @更新时间 `2022-09-08 11:46:19`
 */
export interface GetMamUploadInfoParams {}

/**
 * 接口 [获取上传文件信息↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3111) 的 **返回类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `GET /v1/mam/upload/info`
 * @更新时间 `2022-09-08 11:46:19`
 */
export interface GetMamUploadInfoResult {
  code?: number
  message?: string
  data?: {
    /**
     * kodo上传token
     */
    token?: string
    /**
     * kodo上传的桶
     */
    bucket?: string
    /**
     * kodo上传的key的前缀
     */
    prefix?: string
    /**
     * kodo上传的域名
     */
    host?: string
  }
}

/**
 * 接口 [同步文件信息↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3114) 的 **请求类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `POST /v1/mam/upload/sync`
 * @更新时间 `2022-09-08 11:41:49`
 */
export interface PostMamUploadSyncParams {
  /**
   * 桶
   */
  bucket: string
  /**
   * 上传的key
   */
  key: string
  /**
   * 算法，英文逗号分割
   */
  algos: string
  /**
   * 文件名称
   */
  filename: string
  /**
   * 文件类型
   */
  filetype: string
  /**
   * 文件大小
   */
  filesize: number
  /**
   * 文件封装格式
   */
  file_format?: string
  /**
   * 文件时长，单位毫秒
   */
  duration?: number
  /**
   * 码率
   */
  bit_rate?: number
  /**
   * 画幅比
   */
  aspect_ratio?: string
  /**
   * 分辨率
   */
  resolution?: string
  /**
   * 视频封面
   */
  cover_url?: string
}

/**
 * 接口 [同步文件信息↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3114) 的 **返回类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `POST /v1/mam/upload/sync`
 * @更新时间 `2022-09-08 11:41:49`
 */
export interface PostMamUploadSyncResult {
  code?: number
  message?: string
  data?: {
    /**
     * mongo id
     */
    _id?: string
    /**
     * kodo的桶名称
     */
    bucket?: string
    /**
     * kodo的key
     */
    key?: string
    /**
     * 使用的算法
     */
    algos?: string
    /**
     * 文件名
     */
    filename?: string
    /**
     * 文件类型
     */
    filetype?: string
    /**
     * 上传人
     */
    uploader?: string
    /**
     * 文件大小
     */
    filesize?: number
    /**
     * 文件封装格式
     */
    file_format?: string
    /**
     * 时长，单位毫秒
     */
    duration?: number
    /**
     * 码率
     */
    bit_rate?: number
    /**
     * 画幅比
     */
    aspect_ratio?: string
    /**
     * 分辨率
     */
    resolution?: string
    /**
     * 创建时间，时间戳，单位毫秒
     */
    created_time?: number
    /**
     * kodo对应的文件url
     */
    url?: string
    /**
     * 视频封面
     */
    cover_url?: string
  }
}

/**
 * 接口 [资源列表查询↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3117) 的 **请求类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `GET /v1/mam/assets/list`
 * @更新时间 `2022-09-08 11:42:18`
 */
export interface GetMamAssetsListParams {
  /**
   * 分页
   */
  page_num?: string
  /**
   * 每页显示的最大数目
   */
  page_size?: string
  /**
   * 时间范围，毫秒
   */
  date_time_range?: string
  /**
   * 过滤的标题
   */
  title?: string
  /**
   * 默认值为video，省略时默认为video，可选择的值：video、audio、image
   */
  filetype?: string
}

/**
 * 接口 [资源列表查询↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3117) 的 **返回类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `GET /v1/mam/assets/list`
 * @更新时间 `2022-09-08 11:42:18`
 */
export interface GetMamAssetsListResult {
  code?: number
  message?: string
  data?: {
    total?: number
    current_page_num?: number
    next_page_num?: number
    page_size?: number
    list?: {
      /**
       * mongo id
       */
      _id?: string
      /**
       * kodo的桶名称
       */
      bucket?: string
      /**
       * kodo的key
       */
      key?: string
      /**
       * 使用的算法
       */
      algos?: string
      /**
       * 文件名
       */
      filename?: string
      /**
       * 文件类型
       */
      filetype?: string
      /**
       * 上传人
       */
      uploader?: string
      /**
       * 文件大小
       */
      filesize?: number
      /**
       * 文件封装格式
       */
      file_format?: string
      /**
       * 时长，单位毫秒
       */
      duration?: number
      /**
       * 码率
       */
      bit_rate?: number
      /**
       * 画幅比
       */
      aspect_ratio?: string
      /**
       * 分辨率
       */
      resolution?: string
      /**
       * 创建时间，时间戳，单位毫秒
       */
      created_time?: number
      /**
       * kodo对应的文件url
       */
      url?: string
      /**
       * 视频封面
       */
      cover_url?: string
    }[]
  }
}

/**
 * 接口 [人脸识别查询↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3123) 的 **请求类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `GET /v1/mam/assets/:_id/result/facerec`
 * @更新时间 `2022-09-08 11:18:12`
 */
export interface GetMamAssetsIdResultFacerecParams {
  /**
   * 文件ID
   */
  _id: string
}

/**
 * 接口 [人脸识别查询↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3123) 的 **返回类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `GET /v1/mam/assets/:_id/result/facerec`
 * @更新时间 `2022-09-08 11:18:12`
 */
export interface GetMamAssetsIdResultFacerecResult {
  code?: number
  message?: string
  data?: {
    list?: {
      /**
       * 人物名称
       */
      name?: string
      /**
       * 人脸url
       */
      avatar_url?: string
      /**
       * 时间范围
       */
      duration_range_list?: number[][]
    }[]
  }
}

/**
 * 接口 [OCR识别查询↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3126) 的 **请求类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `GET /v1/mam/assets/:_id/result/ocr`
 * @更新时间 `2022-09-07 14:15:42`
 */
export interface GetMamAssetsIdResultOcrParams {
  /**
   * 文件ID
   */
  _id: string
}

/**
 * 接口 [OCR识别查询↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3126) 的 **返回类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `GET /v1/mam/assets/:_id/result/ocr`
 * @更新时间 `2022-09-07 14:15:42`
 */
export interface GetMamAssetsIdResultOcrResult {
  code?: number
  message?: string
  data?: {
    list?: {
      /**
       * 时间范围
       */
      duration_range: number[]
      /**
       * 文本
       */
      text: string
    }[]
  }
}

/**
 * 接口 [语音识别查询↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3129) 的 **请求类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `GET /v1/mam/assets/:_id/result/asr`
 * @更新时间 `2022-09-07 14:15:27`
 */
export interface GetMamAssetsIdResultAsrParams {
  /**
   * 文件ID
   */
  _id: string
}

/**
 * 接口 [语音识别查询↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3129) 的 **返回类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `GET /v1/mam/assets/:_id/result/asr`
 * @更新时间 `2022-09-07 14:15:27`
 */
export interface GetMamAssetsIdResultAsrResult {
  code?: number
  data?: {
    list?: {
      /**
       * 时间范围
       */
      duration_range: number[]
      /**
       * 文本
       */
      text: string
    }[]
  }
  message?: string
}

/**
 * 接口 [删除资源↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3132) 的 **请求类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `DELETE /v1/mam/assets/:_id`
 * @更新时间 `2022-08-25 10:40:05`
 */
export interface DeleteMamAssetsIdParams {
  /**
   * 文件ID
   */
  _id: string
}

/**
 * 接口 [删除资源↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3132) 的 **返回类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `DELETE /v1/mam/assets/:_id`
 * @更新时间 `2022-08-25 10:40:05`
 */
export interface DeleteMamAssetsIdResult {
  code?: number
  message?: string
  data?: null
}

/**
 * 接口 [重新识别↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3135) 的 **请求类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `POST /v1/mam/assets/:_id/ai-retry`
 * @更新时间 `2022-08-25 10:40:32`
 */
export interface PostMamAssetsIdAiRetryParams {
  /**
   * 文件ID
   */
  _id: string
}

/**
 * 接口 [重新识别↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3135) 的 **返回类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `POST /v1/mam/assets/:_id/ai-retry`
 * @更新时间 `2022-08-25 10:40:32`
 */
export interface PostMamAssetsIdAiRetryResult {
  code?: number
  message?: string
  data?: null
}

/**
 * 接口 [kodo回调↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3138) 的 **请求类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `POST /v1/mam/upload/notify`
 * @更新时间 `2022-08-24 14:33:12`
 */
export interface PostMamUploadNotifyParams {
  id?: string
  pipeline?: string
  code?: number
  desc?: string
  reqid?: string
  inputBucket?: string
  inputKey?: string
  items?: {
    cmd: string
    code: number
    desc: string
    hash?: string
    key?: string
    returnOld: number
    keys?: string[]
  }[]
}

/**
 * 接口 [kodo回调↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/3138) 的 **返回类型**
 *
 * @分类 [api-server↗](http://pili-yapi.aslan.qa.qiniu.io/project/70/interface/api/cat_450)
 * @请求头 `POST /v1/mam/upload/notify`
 * @更新时间 `2022-08-24 14:33:12`
 */
export interface PostMamUploadNotifyResult {
  code?: number
  message?: string
  data?: null
}

/* prettier-ignore-end */
