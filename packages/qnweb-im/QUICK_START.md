# 前期准备

1. 登录官网控制台，获取你的appid，并替换下文中 YOUR_APP_ID。

DEMO 地址：https://github.com/pili-engineering/QNWebIMSDK

SDK 文件下载地址：[qnweb-im.js](https://raw.githubusercontent.com/pili-engineering/QNWebIMSDK/main/src/sdk/qnweb-im.umd.js)

# 快速集成

## 一、初始化

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

## 二、注册用户

通过 im 的 userManager的 asyncRegister 来注册用户
```ts
im.userManage.asyncRegister(this.user).then(() => {
  console.log("注册成功");
}).catch(ex => {
  console.log(ex.message);
});
```

## 三、登录链接服务器

如果SDK设置了autoLogin为true，那么在第一次登录之后再次打开或刷新页面，将不用再登录。 第一次登录，调用im.login

```ts
im.login({
    user,
    password,
});
```

可监听登录信息或进度：

```ts
im.on({
  'loginMessage': message => {console.log(message)}
});
```

## 四、获取会话列表

直接调用userManage的getConversationList，返回包括name、id、类型、未读等列表

```ts
const list = im.userManage.getConversationList();
console.log(list);
```

## 五、断开连接

im的登录信息存储在localstorage，只要删除刷新即可，可自己实现

```ts
window.localStorage.clear();
window.location.reload();
```

# 用户好友

## 添加好友

调用 im.rosterManage 的 asyncApply 方法：

```ts
im.rosterManage.asyncApply({ user_id, alias })
  .then(() => {
    console.log("请求已发送成功!");
});
```

## 删除好友

调用 rosterManage 的 asyncDeleteRoster 方法删除好友

```ts
im.rosterManage.asyncDeleteRoster({ user_id })
  .then(() => {
    console.log("好友已删除");
});
```

## 同意添加好友

调用 rosterManage 的 asyncAccept 方法来同意好友申请

```ts
im.rosterManage.asyncAccept({ user_id }).then(() => {
  console.log("您已通过该好友的申请");
});
```

## 拒绝添加好友

调用 rosterManage 的 asyncDecline 方法来拒绝好友申请

```ts
im.rosterManage.asyncDecline({ user_id }).then(() => {
    console.log("您已拒绝该好友的申请");
});
```

## 获取好友列表

调用 rosterManage 的 getAllRosterDetail 方法来获取好友列表

```ts
const list = im.rosterManage.getAllRosterDetail();
```

监听 onRosterListUpdate 可即时的得知用户列表的改变

```ts
im.on({
    onRosterListUpdate: function() {
        const list = im.rosterManage.getAllRosterDetail();
    }
})
```

# 基础功能

## 单聊

单聊是最基本的聊天界面，提供文字、表情、图片等多种输入内容。

## 群聊

群组的聊天，是多人一起参与的聊天。

1. 创建群组

调用 groupManage 的 asyncCreate 方法来创建一个群组

```ts
im.groupManage
    .asyncCreate({
        name,
        type, // 是否 pulbic， 0， 1
        avatar,
        description,
        user_list, // user ids
    })
    .then(() => {
      console.log("群创建成功");
    });
```

2. 加入群组

调用 groupManage 的 asyncApply 方法来申请加入一个群组

```ts
im.groupManage
  .asyncApply({ group_id, reason })
  .then(() => {
    console.log("请求已发送成功!");
  });
```

3. 退出群组

调用 groupManage 的 asyncLeave 方法来退出群组

```ts
im.groupManage
  . asyncLeave({ group_id })
  .then(() => {
    console.log("已退出群组");
  });
```

4. 解散群组

调用 groupManage 的 asyncDestroy 方法来申请加入一个群组

```ts
im.groupManage
  .asyncDestroy({ group_id })
  .then(() => {
    console.log("群组已解散");
  });
```

5. 获取群成员列表

调用 groupManage 的 getGroupMembers 方法来获取所有成员列表

```ts
const members = im.groupManage.getGroupMembers(state.sid);
console.log(members);
```

6. 获取群组列表 调用 groupManage 的 asyncGetJoinedGroups 方法来获取所有用户加入的群组

```ts
im.groupManage.asyncGetJoinedGroups().then(res => {
  console.log(res);
});
```

7. 获取群组信息 调用 groupManage 的 asyncGetGroupInfo 方法来获取群组的详细信息

```ts
groupManage.asyncGetGroupInfo(group_id).then(res => {
  console.log(res);
});
```

# 消息发送

登录成功之后才能进行聊天操作。发消息时，单聊和群聊是分开发消息的。 由于操作方便，目前只支持文本、图片与文件的发送。

## 构建消息实体

## 文本消息

```ts
const message = {
     uid,  // 用户id，只有单聊时使用
     gid,  // 群id，只有群聊时使用
     content, // 消息文本内容
     priority, // 设置消息的扩散优先级，取值范围0-10。普通人在聊天室发送的消息级别默认为5，可以丢弃，管理员默认为0不会丢弃。其它值可以根据业务自行设置。
}
```

## 图片消息

```ts
const fileInfo = {
     dName,  // file name
     fLen,   // file size
     width,  // image width
     height, // image height
     url,    // image url
 };
 const message = {
     type: 'image',
     uid,
     git, // uid, gid 分别为发送的用户或群
     content: "",
     attachment: fileInfo,
     priority, //设置消息的扩散优先级
 });
```

## 文件消息

```ts
const fileInfo = {
    dName,  // file name
    fLen,   // file size
    width,  // image width
    height, // image height
    url,    // image url
};
const message = {
    type: 'file',
    uid,
    git, // uid, gid 分别为发送的用户或群
    content: "",
    attachment: fileInfo,
    priority, //设置消息的扩散优先级
});
```

## 消息操作

消息实体构建完成后，通过 BMXClient的单例，ChatService类，调用 -sendMessage: 方法，将构建好的消息实体传入，即可实现消息发送

### 发送

```ts
im.sysManage.sendRosterMessage(message);
// or
im.sysManage.sendGroupMessage(message);
```

### 转发

```ts
const fmessage = {
     mid, // 消息id
     uid,
     gid, // uid 或 gid 选其一
 }
 im.sysManage.forwardMessage(message);
 ```

### 撤回

```ts
const fmessage = {
     mid, // 消息id
     uid,
     gid, // uid 或 gid 选其一
 }
 im.sysManage.recallMessage(message);
 ```

# 消息接收监听

## 接收到消息通知

```ts
im.on({
     onRosterMessage: function(message) {
       console.log(message);
     }
 });

 im.on({
     onGroupMessage: function(message) {
       console.log(message);
     }
 });
 ```

## 消息发送后状态回调通知

```ts
im.on({  // 状态发生改变
     onMessageStatusChanged: function(mStatus) {
        console.log(mStatus.mid, mStatus.status);
     }
 });

 im.on({ //消息撤回
     onMessageRecalled: function(mid) {
        console.log(mid);
     }
 });

 im.on({ //消息删除
     onMessageDeleted: function(mid) {
        console.log(mid);
     }
 });

 im.on({ //消息撤回
     onMessageRecalled: function(mid) {
        console.log(mid);
     }
 });

 im.on({ //消息设置未读
     onMessageCanceled: function(mid) {
        console.log(mid);
     }
 });
 ```

# 功能进阶

## 群组@功能

```ts
 im.sysManage.sendMentionMessage({
     gid,
     txt, // 文本消息
     mentionAll, // 是否@所有人
     mentionList, // [id,id ...]
     mentionedMessage, // mention内容
     pushMessage, // 推送
     senderNickname // 发送者昵称
 });
 ```

## 消息正在输入状态

```ts
im.sysManage.sendInputStatusMessage({
     uid,
     status, // nothing or typing
 });
 ```

## 消息搜索

根据关键字搜索指定消息内容

```ts
const ret = im.sysManage.makeSearch(keyword);
 let { groupArr = [], rosterArr = [] } = ret;
 if(groupArr.lenght) {
   console.dir(groupArr[0]);
   // group_id/user_id, name/username, content, avatar
 }
```
