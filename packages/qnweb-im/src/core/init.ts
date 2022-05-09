import { QNIMConfig } from '../types/qn-im';
import coreIM from './core';
import { createChatroom, joinChatroom, leaveChatroom, destroyChatroom } from './chatroom-manage';

/**
 * 创建 IM 对象
 * @param config
 * @constructor
 */
export function init(config: QNIMConfig) {
  const IM = coreIM({
    // dnsServer: 'https://dns.maximtop.com/app_dns',
    ws: false,
    autoLogin: true,
    ...config
  });
  IM.chatroomManage = {
    create: createChatroom.bind(IM),
    join: joinChatroom.bind(IM),
    leave: leaveChatroom.bind(IM),
    destroy: destroyChatroom.bind(IM)
  };
  return IM;
}

