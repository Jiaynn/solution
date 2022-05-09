# 七牛 IM SDK

## 前期准备

DEMO 地址：https://github.com/pili-engineering/QNWebIMSDK

SDK 文件下载地址：[qnweb-im.js](https://raw.githubusercontent.com/pili-engineering/QNWebIMSDK/main/src/sdk/qnweb-im.umd.js)

## 初始化

首先设置 AppID

```ts
const config = {
  appid: "YOUR_APP_ID",
  ws: false,
  autoLogin: true
};
```

然后创建im对象，供全局调用。

```ts
const im = QNIM.init(config);
```

## API

### base 基础部分

#### 登录

```ts
im.login({
  mobile: String, // 与name 2选1
  name: String,
  password: String,
})
```

#### 监听

```ts
im.on('events', (ret) => {
  //do something with ret
})
// or
im.on({
  eventName: (ret) => {
    //do something with ret
  },
  ...
})

```

#### 取消监听

```ts
im.off('events', (ret) => {
  //do something with ret
})
// or
im.off({
  eventName: (ret) => {
    //do something with ret
  },
  ...
})
```

#### 二维码登录

```ts
im.qrlogin({
  password,
  user_id
});
```

#### token登录

```ts
im.tokenLogin(user_id, token)
```

### rosterManager

#### 获取好友id列表

```ts
im.rosterManage.asyncGetRosterIdList().then(res => {
  //
});
```

#### 获取好友信息

```ts
im.rosterManage.asyncGetRosterInfo(state.sid).then(res => {
  //
})
```

#### 用户注册

```ts
rosterManage.asyncRegester({
  username,
  password
}).then(() => {
  //
});
```

#### 根据id列表获取用户详细信息

```ts
im.rosterManage.asnycGetRosterListDetailByIds(rosterIdList).then(res => {
  //
});
```

#### 根据id获取聊天信息

```ts
const rosterMessages = im.rosterManage.getRosterMessageByRid(uid);
```

#### 读取消息

```ts
im.rosterManage.readRosterMessage(uid);
```

#### 删除好友

```ts
im.rosterManage
  .asyncDeleteRoster({ user_id })
  .then(() => {
    alert("好友已删除");
  });
```

#### 获取缓存的所有新用户

```ts
const userMaps = im.rosterManage.getAllRosterDetail();
```

#### 撤回消息，只能撤回5分钟内的

```ts
im.rosterManage.recallMessage(user_id, message_id);
```

#### 删除消息

```ts
im.rosterManage.deleteMessage(user_id, message_id);
```

#### 获取用户的未读数

```ts
const unreadCount = im.rosterManage.getUnreadCount(user_id);
```

#### 设置消息成未读

```ts
im.rosterManage.unreadMessage(user_id, message_id);
```

#### 获取好友信息

```ts
const roserInfo = im.rosterManage.getRosterInfo(user_id);
```

#### 获取好友申请列表

```ts
im.rosterManage
  .asyncGetApplyList({ cursor: "" })
  .then((res = []) => {
    //
  });
```

#### 获取黑名单

```ts
im.rosterManage
  .asyncGetBlockedlist()
  .then((res = []) => {
    //
  });
```

#### 加入黑名单

```ts
im.rosterManage
  .asyncBlockeAdd(user_id)
  .then((res = []) => {
    //
  });
```

#### 移除黑名单

```ts
im.rosterManage
  .asyncBlockeRemove(user_id)
  .then((res = []) => {
    //
  });
```

#### 请求加为好友

```ts
im.rosterManage
  .asyncApply({ user_id, alias })
  .then((res = []) => {
    //
  });
```

#### 通过好友申请

```ts
im.rosterManage
  .asyncAccept({ user_id })
  .then((res = []) => {
    //
  });
```

#### 拒绝好友申请

```ts
im.rosterManage
  .asyncDecline({ user_id })
  .then((res = []) => {
    //
  });
```

#### 按名称搜索用户

```ts
im.rosterManage
  .asyncSearchRosterByName({ username })
  .then((res = []) => {
    //
  });
```

#### 按ID搜索用户

```ts
im.rosterManage
  .asyncSearchRosterById({ user_id })
  .then((res = []) => {
    //
  });
```

### groupManager

#### 获取群信息

```ts
im.groupManage.asyncGetGroupInfo(group_id, fromServer).then(res => {
  //
})
```

#### 获取加入的群组

```ts
im.groupManage.asyncGetJoinedGroups().then(res => {
  //
});
```

#### 打开群组

```ts
// 此方法会准备群组聊天界面的一些必备信息。
im.groupManage.openGroup(group_id);
```

#### 获取缓存的所有群组详情

```ts
const allGroupMap = im.groupManage.getAllGroupDetail();
```

#### 获取群组成员（异步）

```ts
im.groupManage.asyncGetGroupMembers(group_id, fromServer).then(res => {
  //
});
```

#### 获取群组成员（同步）

```ts
const members = im.groupManage.getGroupMembers(group_id);
```

#### 按id获取群组详情

```ts
im.groupManage.asyncGetGroupListDetail(groupIds).then(res => {
  //
});
```

#### 获取群消息

```ts
const groupMessages = rootState.im.groupManage.getGruopMessage(group_id);
```

#### 将群消息设置已读

```ts
im.groupManage.readGroupMessage(group_id)
```

#### 撤回消息

```ts
im.groupManage.recallMessage(group_id, message_id)
```

#### 获取群未读消息数

```ts
const unreadCount = im.groupManage.getUnreadCount(group_id);
```

#### 获取群管理员列表

```ts
im.groupManage.asyncGetAdminList({ group_id }).then(res => {
  //
})
```

#### 群添加管理员

```ts
im.groupManage.asyncAdminAdd({
  group_id,
  user_list
})
  .then(() => {
    //
  });
```

#### 移除管理员

```ts
im.groupManage.asyncAdminRemove({ group_id, user_list }).then(() => {
  //
});
```

#### 获取群公告详情

```ts
im.groupManage.asyncGetAnouncementById({ announcement_id, group_id }).then(res => {
  //
});
```

#### 删除群公告

```ts
im.groupManage
  .asyncAnouncementDelete({ group_id, announcement_id })
  .then(() => {
    //
  });
```

#### 添加群公告

```ts
im.groupManage.asyncAnnouncementEdit({ title, content, group_id })
  .then(() => {
    //
  });
```

#### 群公告列表

```ts
im.groupManage.asyncGetAnnouncementList({ group_id }).then((res = []) => {
  //
});
```

#### 创建群组

```ts
im.groupManage.asyncCreate({
  name,
  type,
  avatar,
  description,
  user_list,
})
  .then(() => {
    //
  });
```

#### 解散群组

```ts
im.groupManage.asyncDestroy({ group_id })
  .then(() => {
    alert("您已解散了此群。。");
  });
```

#### 获取群组详情

```ts
im.groupManage.asyncGetInfo({ group_id }).then(res => {
  //
});
```

#### 更新群头像

```ts
im.groupManage.asyncUpdateAvatar({
  group_id,
  value,
})
  .then(() => {
    alert("更新头像完成");
  });
```

#### 更新群描述

```ts
im.groupManage.asyncUpdateDescription({
  group_id,
  value
}).then(() => {
  //
});
```

#### 更新群扩展

```ts
this.im.groupManage.asyncUpdateExt({
  group_id,
  value
}).then(() => {
  //
});
```

#### 更新群名称

```ts
im.groupManage.asyncUpdateName({
  group_id,
  value
})
  .then(() => {
    //
  });
```

#### 获取群成员

```ts
im.groupManage.asyncGetMemberList(group_id, fromServer).then(res => {
  //
});
```

#### 设置群消息免打扰情况

```ts
im.groupManage.asyncGroupMsgMutemode({
  group_id,
  msg_mute_mode
})
  .then(() => {
    this.groupInfo.msg_mute_mode = this.groupInfo.msg_mute_mode ? 0 : 2;
  });
```

#### 获取群黑名单

```ts
im.groupManage.asyncGroupBannedList({ group_id }).then(res => {
  //
});
```

#### 禁言群成员

```ts
im.groupManage.asyncGroupBab({ group_id, duration, user_list }).then(() => {
  //
});
```

#### 解除成员

```ts
im.groupManage.asyncGroupUnban({ group_id, user_list }).then(() => {
  //
});
```

#### 全员禁言

```ts
im.groupManage.asyncBanAll({group_id,duration: -1}).then(res => {
  console.log(res)
});
```

#### 全员取消禁言

```ts
im.groupManage.asyncUnBanAll({group_id}).then(res => {
  console.log(res)
});
```

#### 判断禁言状态

```ts
// 判断禁言过期时间 groupInfo.ban_expire_time
// 如果为-1表示永久禁言， 如果将来的时间，则表示禁言中
// 全员禁言和单用户的禁言是互不影响的
// 只要有一个是禁言，用户的状态就是禁言
```

#### 设置群成员是否可以邀请

```ts
im.groupManage.asyncUpdateAllowMemberInvitation({
  group_id,
  value
})
  .then(() => {
    //
  });
```

#### 设置群成员是否可以修改群信息

```ts
im.groupManage.asyncUpdateAllowMemberModify({
  group_id,
  value
})
  .then(() => {
    //
  });
```

#### 设置群是否开启已读模式

```ts
im.groupManage.asyncUpdateEnableReadack({
  group_id,
  value
})
  .then(() => {
    //
  });
```

#### 设置群历史是否可见

```ts
im.groupManage.asyncUpdateHistoryVisible({
  group_id,
  value
})
  .then(() => {
    //
  });
```

#### 设置入群是否需要申请

```ts
im.groupManage.asyncUpdateRequireadminapproval({
  group_id,
  apply_approval
})
  .then(() => {
    //
  });
```

#### 更换群主

```ts
im.groupManage.asyncOwnerTransfer({
  group_id,
  new_owner
})
  .then(() => {
    //
  });
```

#### 申请加入群

```ts
im.groupManage.asyncApply({ group_id, reason })
  .then(() => {
    //
  });
```

#### 同意/拒绝申请用户加入群

```ts
im.groupManage.asyncApplyHandle({
  approval: true / false,
  user_id,
  group_id
}).then(() => {
  //
});
```

#### 获取群黑名单

```ts
im.groupManage.asyncGroupBockedlist({ group_id }).then(res => {
  //
});
```

#### 将成员加入黑名单

```ts
im.groupManage.asyncGroupBlock({ group_id, user_list }).then(() => {
  //
});
```

#### 解除黑名单

```ts
im.groupManage.asyncGroupUnblock({ group_id, user_list })
  .then(() => {
    //
  });
```

#### 踢出群组

```ts
im.groupManage.asyncKick({ group_id, user_list }).then(() => {
  //
});
```

#### 获取群邀请列表

```ts
this.im.groupManage.asyncGetInvitationList().then(res => {
  //
});
```

#### 邀请成员加入群

```ts
im.groupManage.asyncInvite({ group_id, user_list }).then(() => {
});
```

#### 同意/拒绝群邀请

```ts
im.groupManage.asyncInviteHandle({
  approval: true,
  user_id,
  group_id
}).then(() => {
  //
});
```

#### 退出群

```ts
im.groupManage.asyncLeave({ group_id })
  .then(() => {
    //
  });
```

#### 修改群名片

```ts
im.groupManage.asyncUpdateDisplayName({
  group_id,
  value
})
  .then(() => {
    //
  });
```

#### 获取群申请列表

```ts
im.groupManage.asncGetApplicationList({ group_list }).then(rs => {
  //
});
```

#### 获取群文件

```ts
im.groupManage.asyncGetFileList({ group_id }).then((res = []) => {
  //
});
```

#### 删除群文件

```ts
im.groupManage.asyncFileDelete({ file_list, group_id }).then(() => {
  //
});
```

### sysManager

#### 发送好友消息

```ts
im.sysManage.sendRosterMessage({
  type,
  uid,
  content,
  attachment
});
```

#### 发送群消息

```ts
im.sysManage.sendGroupMessage({
  type,
  gid,
  content,
  attachment
});
```

#### 群发送@消息

```ts
im.sysManage.sendMentionMessage({
  gid,
  txt,
  mentionAll,
  mentionList,
  mentionedMessage,
  pushMessage,
  senderNickname
});
```

#### 发送输入状态消息

```ts
im.sysManage.sendInputStatusMessage(roster_id, "nothing" / "typing");
```

#### 转发消息

```ts
im.sysManage.forwardMessage({
  uid,
  gid, //2选1
  mid,
});
```

#### 请求历史消息

```ts
im.sysManage.requireHistoryMessage(roster_id / group_id, mid);
```

#### 获取所有消息未读状态

```ts
const allAcks = im.sysManage.getAllMessageStatus() || {};
```

#### 获取群文件上传url

```ts
im.sysManage.asyncGetGroupAvatarUploadUrl({
  group_id,
  "access-token"
})
  .then(res => {
    //
  });
```

#### 获取聊天文件上传地址

```ts
im.sysManage.asyncGetFileUploadChatFileUrl({
  file_type,
  to_id,
  to_type
})
  .then(res => {
    //
  });
```

#### 上传文件

```ts
im.sysManage.asyncFileUpload({
  file,
  fileType,
  to_id,
  toType: "chat",
  chatType: "roster"
})
  .then(res => {
    //
  })
```

#### 拼装图片路径

```ts
const image = im.sysManage.getImage({ avatar, type = 'roster', thumbnail = true });
```

### userManager
#### 获取登录用户的token
```ts
const token =  im.userManage.getToken();
```
#### 获取登录用户的uid
```ts
const cuid = im.userManage.getUid();
```
#### 获取appid
```ts
const appid = im.userManage.getAppid();
```
#### 获取最近回话列表
```ts
const list = im.userManage.getConversationList();
```

#### 发送验证码

```ts
im.userManage
  .asyncUserSendSms({
    mobile,
  })
  .then(() => {
    //
  });
```

#### 发送验证码（通过图片验证码）

```ts
im.userManage
  .asyncCaptchaSms({
    captcha,
    image_id,
    mobile,
  })
  .then(() => {
    //
  });
```

#### 检查用户名是否可用

```ts
im.userManage.asyncUserNameCheck(username).then(() => {
  //
});
```

#### 绑定手机号-使用签名绑定

```ts
im.userManage.asyncUserMobileBindSign({
  mobile,
  sign,
}).then(() => {
  //
});
```

#### 手机号验证码登录

```ts
im.userManage.asyncUserMobileLogin({
  captcha,
  mobile
})
  .then(res => {
    //
  });
```

#### 更新手机号

```ts
im.userManage
  .asyncUpdateMobile({ mobile })
  .then(() => {
    //
  });
```

#### 更新头像

```ts
im.userManage
  .asyncUpdateAvatar({
    avatar
  })
  .then(() => {
    //
  });
```

#### 更新昵称

```ts
im.userManage.asyncUpdateNickName({ nick_name }).then(() => {
  //
});
```

#### 获取用户profile

```ts
im.userManage.asyncGetProfile(true).then(res => {
  //
})
```

#### 更新用户profile

```ts
im.userManage.asyncUpdateProfile({
  username,
  avatar
}).then(res => {
  //
})
```

#### 获取用户设置信息

```ts
im.userManage.asyncGetSettings().then(res => {
  //
})
```

#### 修改用户设置

```ts
im.userManage
  .asyncUpdateSettings({
    "auth_answer": "string",
    "auth_mode": 0,
    "auth_question": "string",
    "auto_download": true,
    "group_confirm": true,
    "id": 0,
    "no_push": true,
    "no_push_detail": true,
    "no_push_end_hour": 0,
    "no_push_start_hour": 0,
    "no_sounds": true,
    "push_nick_name": "string",
    "user_id",
    "vibratory": true
  }).then(() => {
    //
  });
```

### chatroomManage

#### 创建聊天室

```ts
im.chatroomManage.create(name).then(() => {
  //
});
```

#### 加入聊天室

```ts
im.chatroomManage.join(group_id).then(() => {
  // 
})
```

#### 退出聊天室

```ts
im.chatroomManage.leave(group_id).then(() => {
  // 
})
```

#### 解散聊天室

```ts
im.chatroomManage.destroy(group_id).then(() => {
  // 
})
```

### 字段说明

| 字段                | 类型        | 说明                                                         |
| --- | ----| --- |
| fromServer          | boolean     | true表示从服务器取数据， false表示从本地缓存取数据           |
| apply_approval      | 0 \| 1 \| 2 | 入群申请审批设置。0:同意所有申请 1:需要管理员确认 2:拒绝所有申请 |
| 禁言群成员 duration | number | 禁言时长，单位为分钟。-1 为永久禁言                     |
| file_type | number | 文件类型 100: 普通聊天文件, 101: 语音聊天文件(amr格式),102: 图片聊天文件, 103: 视频聊天文件, 104: 语音聊天文件(mp3格式), 200: 普通共享文件, 201: 语音共享文件, 202: 图片共享文件, 203: 视频共享文件 |
| to_type | number | 1: 用户，2: 群组 |
| to_id | number | 用户ID或群ID |

