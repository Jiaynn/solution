import { Chatroom } from '../types/qn-im';

/**
 * 创建聊天室
 * @param name
 */
export function createChatroom(this: any, name: string) {
  return this.groupManage.asyncCreate({
    name,
    type: 2
  }).then((response: Chatroom) => {
    return this.groupManage.asyncUpdateRequireadminapproval({
      group_id: response.group_id,
      apply_approval: 0
    });
  });
}

/**
 * 加入聊天室
 * @param group_id
 */
export function joinChatroom(this: any, group_id: string) {
  return this.groupManage.asyncApply({
    group_id
  });
}

/**
 * 退出聊天室
 * @param group_id
 */
export function leaveChatroom(this: any, group_id: string) {
  return this.groupManage.asyncLeave({
    group_id
  });
}

/**
 * 解散聊天室
 * @param group_id
 */
export function destroyChatroom(this: any, group_id: string) {
  return this.groupManage.asyncDestroy({
    group_id
  });
}