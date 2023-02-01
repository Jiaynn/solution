import { VideoSlimRole } from 'cdn/constants/role'

export const videoSlimGuidesName = 'video-slim'

export const videoSlimGuideDescriptions = {
  [VideoSlimRole.DomainSelect]: '选择一个域名',
  [VideoSlimRole.AddTask]: '为您的热点视频／指定视频文件启动瘦身',
  [VideoSlimRole.PreviewBtn]: '预览瘦身后视频的播放画质效果',
  [VideoSlimRole.EnableCDN]: '启用 CDN 分发，终端用户将访问瘦身后的视频文件',
  [VideoSlimRole.StatisticsLink]: '查看视频瘦身为您节省了多少流量'
}
