/**
 *  程序运行过程状态枚举
 */
import tool from "./sdk/Tool.js"
// import detectrtc from "detectrtc"
import desk_request from "./network/desk_request.js"


let queue = [], queue_string = ``;

export default {
  // 程序启动，webAssembly环境初始化
  loading: 0,
  // webAssembly环境初始化完成
  loaded: 1,
  // record信息请求完成
  recorded: 2,
  // 白板初始化完成
  init_finish: 3,
  // 下载action文件
  download_action: 4,
  // action文件下载完成
  download_action_finished: 5,
  // playback_init成功
  playback_init_success: 6,
  // playback_init失败
  playback_init_failure: 7,
  // 点击播放按钮
  play: 8,
  // 点击暂停按钮
  pause: 9,
  // 拖动进度条
  seek: `A`,
  // 点击切换全屏
  switch_screen: `B`,
  // 白板请求
  network: `C`,
  // 白板下载文件
  download_file: `D`,
  // pdf转换图片
  read_pdf: `E`,
  // 阿里云播放器缓冲
  waiting: `F`,
  // 阿里云播放器缓冲完成重新开始播放
  waited: `G`,
  // 白板初始化完成
  prepared: `H`,
  // 状态上报
  report: status => {
    queue.push(status);
    let process = queue.join(`-`), bytes = tool.stringToBytes(process);
    if (bytes.length > 255) bytes.splice(0, bytes.length - 255);
    queue_string = tool.bytesToString(bytes);
    queue = queue_string.split(`-`);
  },
  // 过程统计上报
  statistics: () => {
    return queue_string
  },
  // 设备数据收集记录
  collect: {
    frequency: 0,
    meetingId: ``,
    report: (type, session, meetingId, initiative) => detectrtc.load(() => desk_request.feedback(type, JSON.stringify({detectrtc, session, meetingId, initiative})))
  },

  // 普通课 model
  model1: 1,
  // 微课 model
  model2: 2,
  // 白板内上传文件
  origin1: 1,
  // 云盘内上传文件
  origin2: 2,
  // resourceInfo
  resourceInfo: (sessionId, fileGroupId, resourceName, attach) => {
    return Object.assign({sessionId, fileGroupId, resourceName}, attach);
  },
  // 云盘文件类型
  cloudTypeFile: 1,
  // 云盘文件夹类型
  cloudTypeFolder: 2,
  // 云盘文件图标
  cloudIcon: file => {
    if (!file.resourceId) return `folder`;
    if (file.resourceType === 2) return `micros`;
    switch (file.mimeType) {
      case `application/pdf`:
        return `pdf`;
      case `application/msword`:
      case `application/vnd.openxmlformats-officedocument.wordprocessingml.document`:
        return `word`;
      case `application/x-ppt`:
      case `application/vnd.ms-powerpoint`:
      case `application/vnd.openxmlformats-officedocument.presentationml.presentation`:
        return `ppt`;
      case `application/x-xls`:
      case `application/vnd.ms-excel`:
      case `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`:
        return `excel`;
      default:
        return `unknown`;
    }
  },
  // 云盘资源类型 所有类型
  resourceTypeAll: -1,
  // 云盘资源类型 image
  resourceTypeImage: 0,
  // 云盘资源类型 office
  resourceTypeOffice: 1,
  // 云盘资源类型 微课
  resourceTypeMicroLesson: 2,
  // 云盘资源类型 widget
  resourceTypeWidget: 3,

  // 留言层级类型，团队
  topicTypeTeam: 1,
  // 留言层级类型，节点（班级）
  topicTypeNode: 2,
  // 留言层级类型，会议
  topicTypeMeeting: 3,
  // 留言层级类型，用户
  topicTypeAccount: 4,
  // 留言层级类型，机构
  topicTypeNodeHost: 7,
  // 留言层级类型，课程
  topicTypeNodeEnv: 9,



  // 资源管理类型：
  // 所有类型
  resourceManagertypeAll: 0,
  // 文档类型
  resourceDocumentTypeAll: 1,
  // 表格类型
  resourceFormTypeAll: 2,
  // 演示类型
  resourcePPTTypeAll: 3,
  // PDF
  resourcePDFTypeAll: 4,
  // 图片
  resourceImageTypeAll: 5, 

}
