import fetch_request from "./fetch_request.js"

const BUSINESS = config.SERVER_URL_DESK;


export default class desk_request {
  constructor() {

  }
  // 获取手机号验证码
  static async getMobileCode(number) {
    return await fetch_request.post(`${BUSINESS}/user/getMobileVerifyCode`, {
      value: number
    }, `user/getMobileVerifyCode`, true)
  }
  // 手机号 + 验证码登录
  static async mobileNumLogin(token, mobileNum) {
    return await fetch_request.post(`${BUSINESS}/user/mobileNumLogin`, {
      token: token,
      mobileNum: mobileNum,
      deviceDesc: config.terminal
    }, `user/mobileNumLogin`, true)
  }
  // 交换session
  static async mobileExchangeSessionId(accountId) {
    return await fetch_request.post(`${BUSINESS}/user/mobileExchangeSessionId`, {
      accountId: accountId,
      deviceDesc: config.terminal
    }, `user/mobileExchangeSessionId`, true)
  }
  // 登录领取活动劵
  static async register(token, mobileNum) {
    return await fetch_request.post(`${BUSINESS}/user/register`, {
      token: token,
      mobileNum: mobileNum
    }, `user/register`, true)
  }
  static async logout() {
    return await fetch_request.post(`${BUSINESS}/user/logout`, {}, `user/logout`, true)
  }
  // 修改用户属性
  static async user_update(key, value) {
    return await fetch_request.post(`${BUSINESS}/user/update`, {
      key: key,
      value: value
    }, `user/update`, true)
  }
  // 修改课程属性
  static async nodeEnv_update(key, value, nodeEnvId) {
    return await fetch_request.post(`${BUSINESS}/nodeEnv/update`, {
      key: key,
      value: value,
      nodeEnvId: nodeEnvId,
    }, `nodeEnv/update`, true)
  }
  // 拉取我的课程列表
  static async getNodeEnvList(offset) {
    return await fetch_request.post(`${BUSINESS}/nodeEnv/getList`, {
      rows: 20,
      offset: offset,
      orderBy: `createTime desc`
    }, `nodeEnv/getList`, true)
  }
  // 拉取成员列表
  static async getMemberList(nodeEnvId) {
    return await fetch_request.post(`${BUSINESS}/nodeEnv/getMemberList`, {
      nodeEnvId: nodeEnvId
    }, `nodeEnv/getMemberList`, true)
  }
  // 删除成员
  static async removeMember(members, roleType, nodeEnvId) {
    return await fetch_request.post(`${BUSINESS}/nodeEnv/removeMember`, {
      members: members,
      roleType: roleType,
      nodeEnvId: nodeEnvId
    }, `nodeEnv/removeMember`, true)
  }
  // 通过邀请码拉取节点详情
  static async getTopicByInviteCode(code) {
    return await fetch_request.post(`${BUSINESS}/topic/getTopicByInviteCode`, {
      value: code
    }, `topic/getTopicByInviteCode`, true)
  }
  // 加入公开课
  static async joinTopic(topicId, topicType) {
    return await fetch_request.post(`${BUSINESS}/topic/requestJoin`, {
      topicId: topicId,
      topicType: topicType
    }, `topic/requestJoin`, true)
  }
  // 点击获取节点详情
  static async getNodeEnv(code) {
    return await fetch_request.post(`${BUSINESS}/nodeEnv/getNodeEnv`, {
      value: code
    }, `nodeEnv/getNodeEnv`, true)
  }
  // 搜索用户
  static async searchUser(number, topicId, topicType) {
    return await fetch_request.post(`${BUSINESS}/user/searchUser`, {
      number: number,
      topicId: topicId,
      topicType: topicType
    }, `user/searchUser`, true)
  }
  // 设置成员角色
  static async addMember(members, roleType, nodeEnvId) {
    return await fetch_request.post(`${BUSINESS}/nodeEnv/addMember`, {
      members: members,
      roleType: roleType,
      nodeEnvId: nodeEnvId
    }, `nodeEnv/addMember`, true)
  }
  // 获取会议模式信息
  static async getMeetingModeInfo(id) {
    return await fetch_request.post(`${BUSINESS}/meeting/getMeetingModeInfo`, {
      value: id
    }, `meeting/getMeetingModeInfo`, true)
  }
  // 拉取分享回放信息
  static async getPlaybackShare(recordId) {
    return await fetch_request.post(`${BUSINESS}/meetingRecord/getRecordDetail`, {
      recordId: recordId
    }, `meetingRecord/getRecordDetail`, true)
  }
  // 创建录制记录
  static async createRecord(model, meetingId, name) {
    return await fetch_request.post(`${BUSINESS}/meetingRecord/createRecord`, {
      name: name,
      model: model,
      meetingId: meetingId
    }, `meetingRecord/createRecord`, true)
  }
  // 创建课程回放分享链接
  static async createRecordWebUrl(recordId) {
    return await fetch_request.post(`${BUSINESS}/meetingRecord/createRecordWebUrl`, {
      recordId: recordId
    }, `meetingRecord/createRecordWebUrl`, true)
  }
  // 修改记录名称
  static async updateRecord(recordId, recordName) {
    return await fetch_request.post(`${BUSINESS}/meetingRecord/updateRecord`, {
      recordId: recordId,
      recordName: recordName
    }, `meetingRecord/updateRecord`, true)
  }
  // 删除课程回放
  static async deleteRecord(recordId) {
    return await fetch_request.post(`${BUSINESS}/meetingRecord/deleteRecord`, {
      value: recordId
    }, `meetingRecord/deleteRecord`, true)
  }
  // 获取nodeHost
  static async getNodeHost(topicId) {
    return await fetch_request.post(`${BUSINESS}/nodeHost/getNodeHost`, {
      value: topicId
    }, `nodeHost/getNodeHost`, true)
  }
  // 获取评论列表
  static async getCommentList(params, offset) {
    return await fetch_request.post(`${BUSINESS}/comment/getList`, {
      rows: 10,
      replay: {
        rows: 1,
        offset: 0,
        orderBy: "createTime desc"
      },
      offset: offset,
      orderBy: "createTime desc",
      topicId: params.topicId,
      topicType: Number(params.topicType)
    }, `comment/getList`, true)
  }
  // 公开课报名
  static async signUp(nodeEnvId) {
    return await fetch_request.post(`${BUSINESS}/nodeEnv/join`, {
      value: nodeEnvId
    }, `nodeEnv/join`, true)
  }
  // 获取会议记录列表
  static async getRecordList(nodeEnvId) {
    return await fetch_request.post(`${BUSINESS}/meetingRecord/getRecordList`, {
      value: nodeEnvId
    }, `meetingRecord/getRecordList`, true)
  }
  // 获取批量回放详情
  static async getBatchDetail(id) {
    return await fetch_request.post(`${BUSINESS}/meetingRecord/getBatchDetail`, {
      id: id
    }, `meetingRecord/getBatchDetail`, true)
  }
  // 添加审核项
  static async addReview(topicId) {
    return await fetch_request.post(`${BUSINESS}/review/addReview`, {
      type: `join`,
      topicType: 9,
      topicId: topicId
    }, `review/addReview`, true)
  }
  // token 换取 session
  static async getSession(token) {
    return await fetch_request.post(`${BUSINESS}/token/getSession`, {
      tokenStr: token
    }, `token/getSession`, true)
  }
  // 查询账户信息
  static async getMyAsset() {
    return await fetch_request.post(`${BUSINESS}/asset/getMyAsset`, {}, `asset/getMyAsset`, true)
  }
  // 账单筛选项
  static async getBudgetList() {
    return await fetch_request.post(`${BUSINESS}/asset/getBudgetList`, {}, `asset/getBudgetList`, true)
  }
  // 查询充值日志
  static async queryPayOrderList(pageNum) {
    return await fetch_request.post(`${BUSINESS}/financial/payOrder/queryPayOrderList`, {
      status: 1,
      pageSize: 10,
      isAsc: `desc`,
      pageNum: pageNum,
      orderByColumn: `createTime`
    }, `financial/payOrder/queryPayOrderList`, true)
  }
  // 查询充值详情
  static async queryOne(id) {
    return await fetch_request.post(`${BUSINESS}/financial/payOrder/queryOne`, {
      id: id
    }, `financial/payOrder/queryOne`, true)
  }
  // 查询消费日志
  static async getLogs(pageNum, budgetTypes) {
    return await fetch_request.post(`${BUSINESS}/asset/getLogs`, {
      pageSize: 10,
      isAsc: `desc`,
      pageNum: pageNum,
      budgetTypes: budgetTypes,
      orderByColumn: `createTime`
    }, `asset/getLogs`, true)
  }
  // 查询消费明细
  static async getLogDetail(pageNum, assetLogId) {
    return await fetch_request.post(`${BUSINESS}/asset/getLogDetail`, {
      isAsc: `asc`,
      pageSize: 20,
      pageNum: pageNum,
      assetLogId: assetLogId,
      orderByColumn: `createTime`
    }, `asset/getLogDetail`, true)
  }
  // 充值
  static async createAndPay(amount, payChannel, payTradeType) {
    return await fetch_request.post(`${BUSINESS}/financial/pay/createAndPay`, {
      amount: amount,
      payChannel: payChannel,
      payTradeType: payTradeType
    }, `financial/pay/createAndPay`, true)
  }
  // 查询充值结果
  static async queryPayStatus(payId, payChannel) {
    return await fetch_request.post(`${BUSINESS}/financial/pay/queryPayStatus`, {
      payId: payId,
      payChannel: payChannel
    }, `financial/pay/queryPayStatus`, true)
  }
  // 获取banner列表
  static async getBanner() {
    return await fetch_request.post(`${BUSINESS}/banner/getBanner`, {}, `banner/getBanner`, true)
  }
  // 我的标签列表
  static async getMyTags() {
    return await fetch_request.post(`${BUSINESS}/tag/getMyTags`, {}, `tag/getMyTags`, true)
  }
  // 更改标签项
  static async updateTagTab(tags, nodeEnvId) {
    return await fetch_request.post(`${BUSINESS}/tag/updateTagTab`, {
      tags: tags,
      topicType: 9,
      topicId: nodeEnvId
    }, `tag/updateTagTab`, true)
  }
  // 创建标签
  static async createTag(name) {
    return await fetch_request.post(`${BUSINESS}/tag/create`, {
      name: name,
      segmentId: 3
    }, `tag/create`, true)
  }
  // 删除标签
  static async deleteTag(tagId) {
    return await fetch_request.post(`${BUSINESS}/tag/delete`, {
      value: tagId
    }, `tag/delete`, true)
  }
  // 我的标签使用列表
  static async getMyUsedTags() {
    return await fetch_request.post(`${BUSINESS}/tag/getMyUsedTags`, {
      value: 9
    }, `tag/getMyUsedTags`, true)
  }
  // 根据标签拉取课程列表
  static async getTopicList(offset, tagIds) {
    return await fetch_request.post(`${BUSINESS}/tag/getTopicList`, {
      rows: 20,
      topicType: 9,
      tagIds: tagIds,
      offset: offset,
      orderBy: `createTime desc`
    }, `tag/getTopicList`, true)
  }
  // 创建课程
  static async create(nodeEnv) {
    return await fetch_request.post(`${BUSINESS}/nodeEnv/create`, nodeEnv, `nodeEnv/create`, true)
  }
  // 删除课程
  static async delete(nodeEnvId) {
    return await fetch_request.post(`${BUSINESS}/nodeEnv/delete`, {
      value: nodeEnvId
    }, `nodeEnv/delete`, true)
  }
  // 退出课程
  static async quit(nodeEnvId) {
    return await fetch_request.post(`${BUSINESS}/nodeEnv/quit`, {
      nodeEnvId: nodeEnvId
    }, `nodeEnv/quit`, true)
  }
  // 获取服务器配置
  static async getConfiguration() {
    return await fetch_request.get(config.configuration, {}, `config/client.json`)
  }
  // 获取事件规则项
  static async getOptions() {
    return await fetch_request.post(`${BUSINESS}/event/getOptions`, {}, `event/getOptions`, true)
  }
  // 获取时间轴列表
  static async getTimeline() {
    return await fetch_request.post(`${BUSINESS}/event/getTimeline`, {}, `event/getTimeline`, true)
  }
  // 创建时间安排
  static async createEvent(event) {
    return await fetch_request.post(`${BUSINESS}/event/create`, event, `event/create`, true)
  }
  // 删除时间安排
  static async deleteEvent(eventId) {
    return await fetch_request.post(`${BUSINESS}/event/delete`, {
      value: eventId
    }, `event/delete`, true)
  }
  // 更新时间安排
  static async updateEvent(updated) {
    return await fetch_request.post(`${BUSINESS}/event/update`, updated, `event/update`, true)
  }
  // 更换手机号, 只传mobileNum+token
  static async changeMobileNum(mobileNum,token) {
    return await fetch_request.post(`${BUSINESS}/user/changeMobileNum`, {
      mobileNum,
      token
    }, `/user/changeMobileNum`, true)
  }
  // 修改用户扩展属性
  static async updateExpends(key,value) {
    return await fetch_request.post(`${BUSINESS}/user/updateExpends`, {
      key,
      value
    }, `/user/updateExpends`, true)
  }
 
  // 反馈
  static async feedback(message,title,contactWay) {
    return await fetch_request.post(`${BUSINESS}/system/feedback`, {
      contactWay,
      message,
      title
    }, `/system/feedback`, true)
  }
  // 获取系统配置项
  static async getConfigEnable() {
    return await fetch_request.post(`${BUSINESS}/system/getConfigEnable`, {}, `/system/getConfigEnable`, true)
  }
  // 二维码邀请信息
  static async getInviteInfo() {
    return await fetch_request.post(`${BUSINESS}/user/getInviteInfo`, {}, `/user/getInviteInfo`, true)
  }
  // 二维码邀请列表+统计
  static async getInviteListStatistic(obj) {
    return await fetch_request.post(`${BUSINESS}/invite/getInviteListStatistic`, obj, `/invite/getInviteListStatistic`, true)
  }
  // 我管理的列表
  static async getMyManagedList() {
    return await fetch_request.post(`${BUSINESS}/nodeHost/getMyManagedList`, {}, `/nodeHost/getMyManagedList`, true)
  }
  // 获取自身的 fileGroupId
  static async getMyFileGroupId() {
    return await fetch_request.post(`${BUSINESS}/user/getMyFileGroupId`, {}, `user/getMyFileGroupId`, true)
  }
  // 创建微课会议
  static async createMicroMeeting() {
    return await fetch_request.post(`${BUSINESS}/meetingRecord/createMicroMeeting`, {
      bgColor: 1,
      boardSizeId: 3
    }, `meetingRecord/createMicroMeeting`, true)
  }
  // 弹窗勾选状态上报
  static async toastClick(value, toastType) {
    return await fetch_request.post(`${BUSINESS}/message/toastClick`, {value, toastType}, `message/toastClick`, true)
  }
  // 弹窗勾选状态上报
  static async toastClick(value, toastType) {
    return await fetch_request.post(`${BUSINESS}/message/toastClick`, {value, toastType}, `message/toastClick`, true)
  }
  // 评论创建
  static async commentCreate(obj) {
    return await fetch_request.post(`${BUSINESS}/comment/create`, obj, `/comment/create`, true)
  }
  // 评论详情
  static async commentDetail(obj) {
    return await fetch_request.post(`${BUSINESS}/comment/detail`, obj, `/comment/detail`, true)
  }
  // 评论列表
  static async commentGetList(obj) {
    return await fetch_request.post(`${BUSINESS}/comment/getList`, {
      offset: obj.offset,
      rows: 20,
      orderBy: "createTime desc",
      replay: {
        offset:0,
        orderBy:"createTime desc",
        rows:10
      },
      topicId: obj.topicId,
      topicType: obj.topicType,
    }, `/comment/getList`, true)
  }
  // 评论子列表
  static async getListByRootComment(obj) {
    return await fetch_request.post(`${BUSINESS}/comment/getListByRootComment`, {
      offset: obj.offset,
      rows: 20,
      rootCommentId: obj.rootCommentId, 
      orderBy: "createTime desc"   
    }, `/comment/getListByRootComment`, true)
  }
  // 获取留言地址
  static async getShareUrl(rootCommentId) {
    return await fetch_request.post(`${BUSINESS}/comment/getShareUrl`, {
      rootCommentId,   
    }, `/comment/getShareUrl`, true)
  }
  // 删除评论
  static async commentDelete(value) {
    return await fetch_request.post(`${BUSINESS}/comment/delete`, {
      value,   
    }, `/comment/delete`, true)
  }
  // 用户点赞
  static async userLike(obj) {
    return await fetch_request.post(`${BUSINESS}/userLike/create`, obj, `/userLike/create`, true)
  }
  // 校验是否关注
  static async focusVerify(obj) {
    return await fetch_request.post(`${BUSINESS}/focus/verify`, obj, `  /focus/verify`, true)
  }
  // 添加关注
  static async focusAdd(obj) {
    return await fetch_request.post(`${BUSINESS}/focus/add`, obj, `/focus/add`, true)
  }
  // 取消关注
  static async focusRemove(obj) {
    return await fetch_request.post(`${BUSINESS}/focus/remove`, obj, `/focus/remove`, true)
  }
  // 反馈接口收集用户信息
  static async feedback(contactWay, message) {
    return await fetch_request.post(`${BUSINESS}/system/feedback`, {title: `webCollect`, contactWay, message}, `system/feedback`, true)
  }
  // 拆
  static async couponActive(obj) {
    return await fetch_request.post(`${BUSINESS}/coupon/active`,obj, `/coupon/active`, true)
  }
  // 红包列表
  static async coupongetList(obj={}) {
    return await fetch_request.post(`${BUSINESS}/coupon/getList`,obj, `/coupon/getList`, true)
  }
}
