import {
  QNFaces,
  QNImage,
  QNStreamingTranscription,
  QNThresholds,
} from './api-common';

/**
 * 动作活体检测校验码
 * https://ap-open-z0.qiniuapi.com/dora-sdk/api/face-actlive-session
 */
export interface QNFaceActliveSessionParams {
  /**
   * 视频动作活体的验证码最小长度：最大3 最小1 默认1
   */
  min_code_length?: number;
  /**
   * 视频动作活体的验证码最大长度：最大3 最小1 默认3
   */
  max_code_length?: number;
}

export interface QNFaceActliveSessionResult {
  request_id?: string;
  response?: {
    /**
     * 错误码
     */
    error_code?: number;
    /**
     * 错误信息
     */
    error_msg?: string;
    /**
     * 请求ID
     */
    serverlogid?: number;
    /**
     * 请求结果
     */
    result?: {
      /**
       * 随机校验码会话id，有效期5分钟
       * 请提示用户在五分钟内完成全部操作验证码使用过即失效
       * 每次使用视频活体前请重新拉取验证码
       */
      session_id?: string;
      /**
       * 随机验证码，数字形式，1~6位数字；
       * 若为动作活体时，返回数字表示的动作对应关系为：
       * 0:眨眼 4:抬头 5:低头 7:左右转头(不区分先后顺序，分别向左和向右转头)
       */
      code?: string;
    };
  };
}

/**
 * 活体检测
 * https://ap-open-z0.qiniuapi.com/dora-sdk/api/face-actlive-v2
 */
export interface QNFaceActliveParams {
  /**
   * 会话ID, 获取方式参考随机校验码接口
   */
  session_id?: string;
  /**
   * base64 编码的视频数据（编码前建议先将视频进行转码，h.264编码，mp4封装）
   * 需要注意的是，视频的base64编码是不包含视频头的，如 data:video/mp4;base64,；
   * 建议视频长度控制在01s-10s之间，
   * 视频大小建议在2M以内（视频大小强制要求在20M以内，推荐使用等分辨率压缩，压缩分辨率建议不小于640*480）
   * 视频大小分辨率建议限制在16~2032之间
   */
  video_base64?: string;
  /**
   * 需要使用合成图功能时, 此项传入spoofing;
   * 需要使用图片质量信息时，则传入quality;
   * 字段之间使用,号分隔，eg：spoofing,quality
   */
  face_field?: string;
}

export interface QNFaceActliveResult {
  request_id?: string;
  response?: {
    /**
     * 错误码
     */
    error_code?: number;
    /**
     * 错误信息
     */
    error_msg?: string;
    /**
     * 请求ID
     */
    serverlogid?: number;
    /**
     * 请求结果
     */
    result?: {
      /**
       * 活体检测的总体打分 范围[0,1]，分数越高则活体的概率越大
       */
      score?: number;
      /**
       * 返回的1-8张图片中合成图检测得分的最大值 范围[0,1]，分数越高则概率越大
       */
      maxspoofing?: number;
      /**
       * 返回的1-8张图片中合成图检测得分的中位数 范围[0,1]，分数越高则概率越大
       */
      spoofing_score?: number;
      /**
       * 阈值 按活体检测分数>阈值来判定活体检测是否通过(阈值视产品需求选择其中一个)
       */
      thresholds?: QNThresholds;
      /**
       * 动作识别结果 pass代表动作验证通过，fail代表动作验证未通过
       */
      action_verify?: string;
      /**
       * 图片信息
       */
      best_image?: QNImage;
      /**
       * 返回1-8张抽取出来的图片信息
       */
      pic_list?: QNImage[];
    };
  };
}

/**
 * 人脸比对
 * https://ap-open-z0.qiniuapi.com/dora-sdk/api/face-compare-v2
 */
export interface QNFaceCompareParams {
  /**
   * 图片信息(总数据大小应小于10M，图片尺寸在1920x1080以下)
   */
  image?: string;
  /**
   * 图片类型
   * **BASE64**:图片的base64值，base64编码后的图片数据，编码后的图片大小不超过2M
   * **URL**:图片的 URL地址( 可能由于网络等原因导致下载图片时间过长)
   */
  image_type?: string;
  /**
   * 人脸的类型
   * **LIVE**：表示生活照：通常为手机、相机拍摄的人像图片、或从网络获取的人像图片等，
   * **IDCARD**：表示身份证芯片照：二代身份证内置芯片中的人像照片，
   * **WATERMARK**：表示带水印证件照：一般为带水印的小图，如公安网小图
   * **CERT**：表示证件照片：如拍摄的身份证、工卡、护照、学生证等证件图片
   * **INFRARED**：表示红外照片,使用红外相机拍摄的照片
   * **HYBRID**：表示混合类型，如果传递此值时会先对图片进行检测判断所属类型(生活照 or 证件照)（仅针对请求参数 image_type 为 BASE64 或 URL 时有效）
   * 默认`LIVE`
   */
  face_type?: string;
  /**
   * 图片质量控制
   * **NONE**: 不进行控制
   * **LOW**:较低的质量要求
   * **NORMAL**: 一般的质量要求
   * **HIGH**: 较高的质量要求
   * 默认 `NONE`
   * 若图片质量不满足要求，则返回结果中会提示质量检测失败
   */
  quality_control?: string;
  /**
   * 活体检测控制
   * **NONE**: 不进行控制
   * **LOW**:较低的活体要求(高通过率 低攻击拒绝率)
   * **NORMAL**: 一般的活体要求(平衡的攻击拒绝率, 通过率)
   * **HIGH**: 较高的活体要求(高攻击拒绝率 低通过率)
   * 默认 `NONE`
   * 若活体检测结果不满足要求，则返回结果中会提示活体检测失败
   */
  liveness_control?: string;
  /**
   * 人脸检测排序类型
   * **0**:代表检测出的人脸按照人脸面积从大到小排列
   * **1**:代表检测出的人脸按照距离图片中心从近到远排列
   * 默认为`0`
   */
  face_sort_type?: number;
  /**
   * 合成图控制参数
   * **NONE**: 不进行控制
   * **LOW**:较低的合成图阈值数值，由于合成图判定逻辑为大于阈值视为合成图攻击，该项代表低通过率、高攻击拒绝率
   * **NORMAL**: 一般的合成图阈值数值，由于合成图判定逻辑为大于阈值视为合成图攻击，该项代表平衡的攻击拒绝率, 通过率
   * **HIGH**: 较高的合成图阈值数值，由于合成图判定逻辑为大于阈值视为合成图攻击，该项代表高通过率、低攻击拒绝率
   * 默认为`NONE`
   */
  spoofing_control?: string;
}

export interface QNFaceCompareResult {
  request_id?: string;
  response?: {
    /**
     * 错误码
     */
    error_code?: number;
    /**
     * 错误信息
     */
    error_msg?: string;
    /**
     * 请求ID
     */
    log_id?: number;
    /**
     * 请求结果
     */
    result?: {
      /**
       * 人脸相似度得分，推荐阈值80分
       */
      score?: number;
      /**
       * 人脸信息列表
       */
      face_list?: Array<{
        /**
         * 人脸的唯一标志
         */
        face_token?: string;
      }>;
    };
  };
}

/**
 * 人脸检测
 * https://ap-open-z0.qiniuapi.com/dora-sdk/api/face-detect-v2
 */
export interface QNFaceDetectParams {
  /**
   * 图片信息(总数据大小应小于10M，图片尺寸在1920x1080以下)，图片上传方式根据image_type来判断。
   * 两张图片通过json格式上传，格式参考表格下方示例
   */
  image?: string;
  /**
   * 图片类型
   * **BASE64**:图片的base64值，base64编码后的图片数据，编码后的图片大小不超过2M；
   * **URL**:图片的 URL地址( 可能由于网络等原因导致下载图片时间过长)；
   * **FACE_TOKEN**: 人脸图片的唯一标识，调用人脸检测接口时，会为每个人脸图片赋予一个唯一的FACE_TOKEN，同一张图片多次检测得到的FACE_TOKEN是同一个。
   */
  image_type?: string;
  /**
   * 包括`age,expression,face_shape,gender,glasses,landmark,landmark150,quality,eye_status,emotion,face_type,mask,spoofing`信息逗号分隔.
   * 默认只返回`face_token、人脸框、概率和旋转角度`
   */
  face_field?: string;
  /**
   * 最多处理人脸的数目，默认值为1，根据人脸检测排序类型检测图片中排序第一的人脸（默认为人脸面积最大的人脸），最大值120
   */
  max_face_num?: number;
  /**
   * 人脸的类型
   * **LIVE**：表示生活照：通常为手机、相机拍摄的人像图片、或从网络获取的人像图片等，
   * **IDCARD**：表示身份证芯片照：二代身份证内置芯片中的人像照片，
   * **WATERMARK**：表示带水印证件照：一般为带水印的小图，如公安网小图
   * **CERT**：表示证件照片：如拍摄的身份证、工卡、护照、学生证等证件图片
   * 默认`LIVE`
   */
  face_type?: string;
  /**
   * 活体检测控制
   * **NONE**: 不进行控制
   * **LOW**:较低的活体要求(高通过率 低攻击拒绝率)
   * **NORMAL**: 一般的活体要求(平衡的攻击拒绝率, 通过率)
   * **HIGH**: 较高的活体要求(高攻击拒绝率 低通过率)
   * 默认 `NONE`
   * 若活体检测结果不满足要求，则返回结果中会提示活体检测失败
   */
  liveness_control?: string;
  /**
   * 人脸检测排序类型
   * **0**:代表检测出的人脸按照人脸面积从大到小排列
   * **1**:代表检测出的人脸按照距离图片中心从近到远排列
   * 默认为0
   */
  face_sort_type?: number;
  /**
   * 是否显示检测人脸的裁剪图base64值
   * 0：不显示（默认）
   * 1：显示
   */
  display_corp_image?: number;
}

export interface QNFaceDetectResult {
  request_id?: string;
  response?: {
    /**
     * 错误码
     */
    error_code?: number;
    /**
     * 错误信息
     */
    error_msg?: string;
    /**
     * 请求ID
     */
    log_id?: number;
    /**
     * 请求结果
     */
    result?: {
      /**
       * 检测到的图片中的人脸数量
       */
      face_num?: number;
      /**
       * 人脸信息列表，具体包含的参数参考下面的列表。
       */
      face_list?: QNFaces[];
    };
  };
}

/**
 * 实时音频识别
 * wss://ap-open-ws.service-z0.qiniuapp.com/v2/asr
 */
export interface QNAsrParams {
  /**
   * 数据格式，1: pcm，2: AAC，3: MPEG2;默认1
   */
  aue: number;
  /**
   * 数据采样率，取值: 48000, 44100, 32000, 16000, 8000;默认16000
   */
  voice_sample: number;
  /**
   * 识别语言，中文: 1, 英文: 2, 中英混合: 0; 默认 1
   */
  model_type?: number;
  /**
   * 数据流id，不同流不同
   */
  voice_id?: string;
  /**
   * 识别关键字; 相同读音时优先识别为关键字。每个词 2-4 个字, 不同词用 `,` 分割
   */
  key_words?: string[];
  /**
   * 请求时间戳, 单位秒
   */
  e: number;
  /**
   * 请求签名, [签算方式](https://developer.qiniu.com/kodo/1202/download-token)
   */
  token: string;
}

export interface QNAsrResult {
  /**
   * 此识别结果是否为最终结果
   */
  isFinal: boolean;
  /**
   * 此识别结果是否为第一片
   */
  isBegin: boolean;
  /**
   * 最好的转写候选
   */
  bestTranscription: QNStreamingTranscription;
}

/**
 * 文字转语音
 * https://ap-open-z0.qiniuapi.com/dora-sdk/api/voice-tts-v2
 */
export interface QNVoiceTtsParams {
  /**
   * TTS 发音人标识音源 id 0-6,实际可用范围根据情况, 可以不设置,默认是 0;
   * 其中0：女声（柔和）；1，女声（正式）；2，女生（柔和带正式）；3：男声（柔和），4：男声（柔和带正式）；5：男声（闽南话）；6：女生（闽南话）。
   */
  spkid?: number;
  /**
   * 需要进行语音合成的文本内容，最短1个字，最长200字
   */
  content: string;
  /**
   * 可不填，不填时默认为 3。
   * audioType=3 返回 16K 采样率的 mp3
   * audioType=4 返回 8K 采样率的 mp3
   * audioType=5 返回 24K 采样率的 mp3
   * audioType=6 返回 48k采样率的mp3
   * audioType=7 返回 16K 采样率的 pcm 格式
   * audioType=8 返回 8K 采样率的 pcm 格式
   * audioType=9 返回 24k 采样率的pcm格式
   * audioType=10 返回  8K 采样率的 wav 格式
   * audioType=11 返回 16K 采样率的 wav 格式
   */
  audioType?: number;
  /**
   * 音量大小，取值范围为 0.75 - 1.25，默认为1
   */
  volume?: number;
  /**
   * 语速，取值范围为 0.75 - 1.25，默认为1
   */
  speed?: number;
}

export interface QNVoiceTtsResult {
  request_id?: string;
  response?: {
    /**
     * 错误信息
     */
    msg: string;
    /**
     * 错误码
     * | code | 说明 |
     * | :--- | :--- |
     * | 0    | 成功 |
     */
    code: string;
    result: {
      /**
       * 合成音频的下载地址
       */
      audioUrl: string;
    };
  };
}
