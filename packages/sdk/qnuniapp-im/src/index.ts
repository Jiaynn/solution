import flooIM from './floo-2.0.0.uniapp';

/**
 * 创建聊天室
 * @param name
 */
function createChatroom(name) {
  return this.groupManage.asyncCreate({
    name,
    type: 2
  }).then((response) => {
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
function joinChatroom(group_id) {
  return this.groupManage.asyncApply({
    group_id
  });
}

/**
 * 退出聊天室
 * @param group_id
 */
function leaveChatroom(group_id) {
  return this.groupManage.asyncLeave({
    group_id
  });
}

/**
 * 解散聊天室
 * @param group_id
 */
function destroyChatroom(group_id) {
  return this.groupManage.asyncDestroy({
    group_id
  });
}

/**
 * 创建 im 对象
 * @param config
 * @returns {*}
 */
export function init(config) {
  const im = flooIM({
    autoLogin: true,
    ws: true,
    ...config
  });
  im.chatroomManage = {
    create: createChatroom.bind(im),
    join: joinChatroom.bind(im),
    leave: leaveChatroom.bind(im),
    destroy: destroyChatroom.bind(im)
  };
  return im;
}

export const version = SDK_VERSION;