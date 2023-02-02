import { RoomTokenJSON } from '../types';

/**
 * 解析 roomToken
 * @param roomToken
 */
export function parseRoomToken(roomToken?: string | null): RoomTokenJSON {
  if (roomToken) {
    const splitRoomToken = roomToken.split(':');
    const lastString = splitRoomToken[splitRoomToken.length - 1] || '';
    const decodedString = atob(lastString);
    return JSON.parse(decodedString) || {};
  }
  return {};
}