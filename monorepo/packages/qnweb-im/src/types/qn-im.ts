/**
 * 初始化配置
 */
export interface QNIMConfig {
  appid: string;
  ws?: boolean;
  autoLogin?: boolean;
}

/**
 * SDK HTTP 请求响应体
 */
export interface SDKHTTPRequestResponse<V = any> {
  code: number;
  data?: V;
  message?: string;
}

/**
 * 注册响应数据
 */
export interface RegisterResData {
  user_id: number;
  auto_download: boolean;
  group_confirm: boolean;
  no_sounds: boolean;
  no_push: boolean;
  vibratory: boolean;
  no_push_detail: boolean;
  auth_mode: number;
  no_push_start_hour: number;
  no_push_end_hour: number;
}

/**
 * 聊天室
 */
export interface Chatroom {
  name: string;
  status: number;
  type: number;
  group_id: number;
  owner_id: number;
  created_at: number;
  updated_at: number;
  member_invite: boolean;
  apply_approval: number;
  read_ack: boolean;
  history_visible: boolean;
  member_modify: boolean;
}

/**
 * 消息
 */
export interface IGroupMessage {
  id?: string;
  from?: string;
  to?: string;
  content?: string;
  type?: string;
  status?: number;
  timestamp?: string;
  toType?: string;
}

/**
 * 消息发送状态改变
 */
export interface ISendingMessageStatusChangedRes {
  mid: number;
  status: 'sending' | 'sent' | 'failed';
  uid?: number;
}