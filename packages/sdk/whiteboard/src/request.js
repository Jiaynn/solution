import tool from "./Tool.js"
import webSocket from "./WebSocket.js"
import fetch_request from "./fetch_request.js"
import controller from "./WhiteboardController.js"

//let SDK = config.SERVER_URL_DESK_BOARD, FILE = config.SERVER_URL_FILE, STS = `${FILE}/oss/getAKToken`;


export default class Request {
  constructor() {

  }
  static updateConfig(info) {

  }
  // webAssembly http请求
  static async assemblyHttp(params) {
      /*
    if(!params.method)
    {
      console.log(params.params);
      let url = controller.config.sdkFileHost + params.url;
      let size = params.params.size;
  
      if(params.params)
      {
        url += "?";

        for(const [key,value ] of Object.entries(params.params))
        {
          if(!url.endsWith("?"))
          {
            url += "&";
          }
          url +=`${key}=${value}`;
        };

      }
     url = encodeURI(url);
     // url = "https://commonshared.oss-cn-beijing.aliyuncs.com/svg/svg.json";
      // url = "http://127.0.0.1:5500/svg.json";
      return await fetch(url,{
          mode:'cors',
          headers: {
            "accept":"application/json"
          }
        }).then(res => res.json())
        .then(data => {
          return data;
        })
        .catch(err =>{ throw err;});
    }
    else
    */
      return await fetch_request[params.method ? `post` : `get`](controller.config.sdkFileHost + params.url, params.params, params.url);
  }
  // 获取oss sdk accessKey
  static async accessKey(fileGroupId) {
    return await fetch_request.get(`${controller.config.ossStsUrl}`, {
      fileGroupId: fileGroupId
    }, `oss/getAKToken`)
  }
  // 在目录下创建（上传）文件
  static async addResource(resource) {
    return await fetch_request.post(`${controller.config.sdkFileHost}/FileServer/group/addResource`, resource, `group/addResource`,true)
  }
  // 更新微课是否推送到个人主页
  static async updatePublicMicro(fileGroupId, resourceId, isPublic) {
    return await fetch_request.post(`${controller.config.sdkFileHost}/group/updatePublicMicro`, {fileGroupId, resourceId, isPublic}, `group/updatePublicMicro`)
  }
  // resource转移
  static async copyResource(fileGroupId, resourceId, userId) {
    return await fetch_request.post(`${controller.config.sdkFileHost}/group/copy`, {fileGroupId, resourceId, userId}, `group/copy`)
  }
  // 判断文件是否存在
  static async exist(md5, name, fileGroupId) {
    return await fetch_request.get(`${controller.config.sdkFileHost}/FileServer/group/exist`, {
      md5: md5,
      name: name,
      fileGroupId: fileGroupId
    }, `group/exist`)
  }
  // PDF转换图片
  static async pdfExchangeImage(resourceId, pageNo, objectName) {
    return await fetch_request.get(`${controller.config.sdkFileHost}/resource/pdfExchangePicture`, {
      pageNo: pageNo,
      resourceId: resourceId,
      objectName: objectName,
      fileGroupId: controller.config.fileGroupId
    }, `resource/pdfExchangePicture`)
  }
  // 加入会议（权限版）
  static joinMeeting(joinString) {
    webSocket.send_message(`join_meeting`, [tool.zip(JSON.stringify(joinString))]);
  }
  // 离开会议（权限版）
  static leaveMeeting(sessionId) {
    webSocket.send_message(`leave_meeting`, [sessionId]);
  }
  // 变更会议状态
  static meeting_permission(type, status, password) {
    let meetingInfo = controller.config.joinString;
    let message = {
      type: type,
      status: status,
      password: password,
      meetingId: meetingInfo.meetingId,
      sessionId: meetingInfo.session.sessionId
    };
    webSocket.send_message(`meeting_status`, [tool.zip(JSON.stringify(message))]);
  }
  // 变更个人权限
  static permission_operation(type, status, targets, roleId) {
    let meetingInfo = controller.config.joinString;
    if(targets && targets.find(item => item === meetingInfo.session.userId)) return;
    let message = {
      type: type,
      status: status,
      roleId: roleId,
      targets: targets,
      meetingId: meetingInfo.meetingId,
      sessionId: meetingInfo.session.sessionId
    };
    webSocket.send_message(`privilege`, [tool.zip(JSON.stringify(message))]);
  }
  // 拉取云盘信息
  static async getResourceList(catalogId, fileGroupId) {
    return await fetch_request.post(`${controller.config.sdkFileHost}/group/getResourceList`, {
      catalogId: catalogId,
      fileGroupId: fileGroupId
    }, `group/getResourceList`)
  }
  // 文件复制（云盘到白板）
  static async copy(resourceId) {
    let meetingInfo = controlle.config.joinString;
    return await fetch_request.post(`${controller.config.sdkFileHost}/group/copy`, {
      resourceId: resourceId,
      fileGroupId: meetingInfo.fileGroupId,
      // sessionId: meetingInfo.session.sessionId,
      userId: meetingInfo.session.userId
    }, `group/copy`)
  }
  // 声网SDK接口
  static async getChannelKey() {
    let meetingInfo = controller.config.joinString;
    return await fetch_request.get(`${controller.config.sdkApiHost}/user/createChannelKey`, {
      channelName: meetingInfo.meetingId,
      sessionId: meetingInfo.session.sessionId
    }, `user/createChannelKey`)
  }
  // 腾讯音视频服务
  static async getUserSig() {
    let meetingInfo = controller.config.joinString;
    return await fetch_request.get(`${controller.config.sdkApiHost}/user/getSign`, {
      channelName: meetingInfo.meetingId,
      sessionId: meetingInfo.session.sessionId
    }, `user/getSign`)
  }
  // 获取record
  static async getRecord(recordId) {
    return await fetch_request.get(`${controller.config.sdkApiHost}/playback/getRecord`, {
      recordId: recordId
    }, `playback/getRecord`)
  }
  // 拉取历史聊天记录
  static async getChatList(id) {
    let meeting_info = controller.config.joinString;
    return await fetch_request.post(`${controller.config.sdkApiHost}/chat/getChatList`, {
      messageId: id || ``,
      chatRoomId: meeting_info.chatRoomId,
      sessionId: meeting_info.session.sessionId
    }, `chat/getChatList`)
  }
  // 获取公开的微课
  static async getPublicMicro(offset, fileGroupId) {
    return await fetch_request.get(`${FILE}/group/getPublicMicro`, {
      rows: 10,
      offset: offset,
      fileGroupId: fileGroupId
    }, `group/getPublicMicro`)
  }
  // 获取分享列表资源
  static async getList(resourceIds) {
    return await fetch_request.get(`${FILE}/resource/getList`, {
      resourceIds: JSON.stringify(resourceIds)
    }, `resource/getList`)
  }
  // 更新白板缩略图
  static async updateUrl(documentId, url) {
    let meeting_info = controller.config.joinString;
    return await fetch_request.post(`${controller.config.sdkApiHost}/document/updateUrl`, {
      url: url,
      documentId: documentId,
      meetingId: meeting_info.meetingId,
      sessionId: meeting_info.session.sessionId
    }, `document/updateUrl`)
  }
  // 拉取图形列表
  static async getSvgJson() {
    return await fetch_request.get(`https://commonshared.oss-cn-beijing.aliyuncs.com/svg/svg.json`, {}, `svg/svg.json`)
  }
  // 增加目录
  static async createCatalog(name, fileGroupId,higherId) {
    return await fetch_request.post(`${FILE}/group/createCatalog`, {
      name,
      fileGroupId,
      higherId  
    }, `/group/createCatalog`)
  }
  // 删除资源文件/批量删除
  static async deleteResource(fileGroupId, higherId, resources) {
    return await fetch_request.post(`${FILE}/group/deleteResource`, {
      resources,
      fileGroupId,
      higherId,
    }, `/group/deleteResource`)
  }
  // 修改目录名称
  static async updateCatalogName(name, fileGroupId,catalogId) {
    return await fetch_request.post(`${FILE}/group/updateCatalogName`, {
      name,
      fileGroupId,
      catalogId   
    }, `/group/updateCatalogName`)
  }
  // 修改资源文件名
  static async updateResourceName(resourceName , fileGroupId, resourceId, catalogId  ) {
    return await fetch_request.post(`${FILE}/group/updateResourceName`, {
      resourceName,
      fileGroupId,
      resourceId,
      catalogId   
    }, `/group/updateResourceName`)
  }
  // 根据文件类型筛选文件
  static async filter(fileGroupId, resourceType, offset, rows ) {
    return await fetch_request.get(`${FILE}/group/filter`, {
      fileGroupId,
      resourceType,
      offset,
      rows   
    }, `/group/filter`)
  }
  // 搜索文件
  static async searchResource(fileGroupId, sessionId, str) {
    return await fetch_request.post(`${FILE}/group/searchResource`, {
      fileGroupId,
      sessionId,
      str 
    }, `/group/searchResource`)
  }
  // 移动文件
  static async moveFile(fileGroupId, files , targetCatalogId,sessionId) {
    return await fetch_request.post(`${FILE}/group/moveFile`, {
      fileGroupId,
      files,
      targetCatalogId ,
      sessionId
    }, `/group/moveFile`)
  }
  // 将公共bucket下的资源存到个人云盘下
  static async copyResourceSwitch(obj={}) {
    return await fetch_request.post(`${FILE}/group/copyResource`,obj,`/group/copyResource`)
  }
  // 收藏/取消收藏资源
  static async groupCollect(obj={}) {
    return await fetch_request.post(`${FILE}/group/collect`,obj,`/group/collect`)
  }
  // 资源管理器
  static async getResource(obj={}) {
    return await fetch_request.get(`${FILE}/group/getResource`,obj,`/group/getResource`)
  }
  // 删除最近使用资源
  static async delResource(obj={}) {
    return await fetch_request.post(`${FILE}/group/delResource`,obj, `/group/delResource`)
  }
  // SDK获取加入房间所需信息
  static async getRoomInfo(url,appId,meetingId,userId,token) {
    return await fetch_request.post(url, {
      versionCode: "0.0.1",
      operationSystem: "web",
      token: token,
      appId: appId,
      meetingId: meetingId,
      memberVO: {
        roleId: 6,
        headPic: "*****",
        nickName: "web-wxy",
        userId: userId,
      }
    } , `/meeting/join`)
  }
}