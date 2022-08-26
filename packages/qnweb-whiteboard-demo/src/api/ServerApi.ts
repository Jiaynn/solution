import { requestConfig } from '@/config';

export interface CreateMeetingParams {
  /**
   * [0,1,2]
   * 0 标准模式，1 ppt模式，2 pdf模式
   */
  type: number;
  /**
   * 资源的地址，必须为https开头，ppt、pdf模式下必填, 标准模式下不需要此参数
   */
  url?: string;
  /**
   * [0.5~2.2]
   * 宽高比, 必填
   */
  aspectRatio: number;
  /**
   * [1 ~ 5]
   * 扩展倍数，如果为 标准模式，必填
   */
  zoomScale?: number;
  /**
   * 非必填，如果传，会在返回值中返回用户加入房间的token
   */
  userIds?: string[];
}

export interface CreateMeetingResult {
  data: {
    appId: string,
    meetingId: string,
    bucketId: string,
    userTokens?: Record<string, string> | null,
  };
}

/**
 * https://cf.qiniu.io/pages/viewpage.action?pageId=92208933
 */
export class ServerApi {
  static baseURL = requestConfig.baseURL;

  /**
   * 创建会议
   * @param params
   */
  static createMeeting(params: CreateMeetingParams): Promise<CreateMeetingResult> {
    return fetch(`${ServerApi.baseURL}/room`, {
      method: 'POST',
      body: JSON.stringify(params),
    }).then((result) => result.json());
  }

  /**
   * TODO
   * 删除会议
   */
  static deleteMeeting(): void {
    return;
  }

  /**
   * TODO
   * 创建bucket
   */
  static createBucket(): void {
    return;
  }

  /**
   * TODO
   * 删除bucket
   */
  static deleteBucket(): void {
    return;
  }

  /**
   * TODO
   * 获取用户加入白板会议的token
   */
  static createToken(): void {
    return;
  }
}
