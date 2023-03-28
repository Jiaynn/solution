interface SchemeLists{
  id:number
  type:number
  title:string
  img:string
  desc:string
  link_console:string
  link_more:string
}

interface SchemeTabs{
  id:number
  title:string
}

export const lists:SchemeLists[] = [
  {
    id: 0,
    type: 1,
    title: '图片处理分发加速',
    img: 'https://demo-qnrtc-files.qnsdk.com/lowcode/docuement.png',
    desc: '针对有海量用户生成内容的场景。七牛云存储服务的高并发能力使您灵活应对大流量的业务场景。您可以对存储在云端的图片文件进行数据处理。',
    link_console: window.location.origin + '/solutions/image/configuration/step/1?shouldCreateBucket=false&configurationState=true',
    link_more: ''
  },
  {
    id: 1,
    type: 1,
    title: '视频点播',
    img: 'https://demo-qnrtc-files.qnsdk.com/lowcode/sdk.png',
    desc: '针对短视频、长视频、直播等应用，需要为海量在线视频提供视频存储、网络分发加速、视频智能处理等功能，为C端用户提供更稳当、更流畅的播放体验，也为企业用户提供稳定、安全的视频服务。',
    link_console: '',
    link_more: ''
  },
  {
    id: 3,
    type: 0,
    title: '互动营销',
    img: 'https://demo-qnrtc-files.qnsdk.com/lowcode/yingixao.png',
    desc: '覆盖娱乐互动直播、电商直播带货、语聊房、互动教育等多应用场景，基于七牛云音视频、AI 智能算法和网络，提供易接入、强扩展、高效部署的音视频服务，助力企业快速搭建高品质的专属音视频互动营销业务平台。',
    link_console: '',
    link_more: ''
  },
  {
    id: 4,
    type: 0,
    title: '统一消息营销触达',
    img: 'https://demo-qnrtc-files.qnsdk.com/lowcode/sms.png',
    desc: '提供了包括短信、5G消息、微信、钉钉、客户端APP等多种消息触达客户通道，支持预设消息内容与变量，规范消息格式； 提供推送统计报表，从渠道、通道、用户多维度分析转换率，以进行针对性促活。',
    link_console: window.location.origin + '/solutions/message',
    link_more: ''
  },
  {
    id: 5,
    type: 0,
    title: '企业直播',
    img: 'https://demo-qnrtc-files.qnsdk.com/lowcode/zhibo.png',
    desc: '覆盖营销、带货、企业培训、活动直播等场景；无需开发即可使用，快速集成和接入直播服务，支持与企业自有的会员系统、商城系统对接；丰富的互营销互动及数据分析能力，实现内容生产、直播数据与流量三方面的闭环。',
    link_console: 'https://s.qiniu.com/uYjYB3 ',
    link_more: 'https://www.qiniu.com/solutions/ent-live'
  }
]

export const tabs:SchemeTabs[] = [
  {
    id: 0,
    title: '视频营销'
  },
  {
    id: 1,
    title: '社交互娱'
  }
]
