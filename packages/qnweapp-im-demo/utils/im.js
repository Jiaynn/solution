/**
 * im 发消息
 * @param {*} im 
 * @param {*} params
 */
export function sendMessage(im, params) {
  const { group_id, text } = params || {};
  if (im && group_id) {
    const cuid = im.userManage.getUid() + '';
    const message = {
      content: JSON.stringify({
        content: {
          action: 'pubChatText',
          msgStr: {
            senderId: cuid,
            senderName: '',
            msgContent: text
          }
        }
      }),
      gid: group_id
    };
    im.sysManage.sendGroupMessage(message);
  }
}