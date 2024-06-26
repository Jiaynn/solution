/**
 * roomToken存在的信息
 */
export interface QNRtcRoomInfo {
  appId?: string;
  expireAt?: number;
  permission?: string;
  roomName?: string;
  userId?: string;
}

/**
 * 解析roomToken
 * @param token
 */
export function parseRoomToken(token: string): QNRtcRoomInfo | null {
  try {
    const splitRoomToken = token.split(':');
    const lastString = splitRoomToken[splitRoomToken.length - 1] || '';
    const decodedString = atob(lastString);
    return JSON.parse(decodedString) || {};
  } catch (e) {
    return null;
  }
}
