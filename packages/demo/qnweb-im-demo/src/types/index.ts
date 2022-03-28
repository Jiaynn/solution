/**
 * 用户登录信息
 */
export interface LoginInfo {
  username: string;
  password: string;
}

/**
 * 解析 roomToken 获取到的值
 */
export interface RoomTokenJSON {
  appId?: string;
  expireAt?: number;
  permission?: string;
  roomName?: string;
  userId?: string;
}
