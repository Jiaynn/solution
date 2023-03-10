/**
 * 方案code&name定义
 * https://cf.qiniu.io/pages/viewpage.action?pageId=118244369
 */
export enum Solution {
  /** 企业直播/私域营销/企业培训 */
  EnterpriseLive = 'enterprise_live',
  /** 互动营销 */
  InteractMarketing = 'interact_marketing',
  /** 电商直播 */
  EcommerceLive = 'ecommerce_live',
  /** 短视频点播营销 */
  ShortvideoMarketing = 'shortvideo_marketing',
  /** 营销推送 */
  MarketingPush = 'marketing_push',
  /** 图片处理分发加速 */
  Image = 'image',
  /** 视频点播 */
  Vod = 'vod',
  /** 互动直播 */
  InteractLive = 'interact_live',
  /** 幼儿园监控 */
  KindergartenMonitoring = 'kindergarten_monitoring',
  /** 智能家居&猫眼 */
  SmarthomeSurvilance = 'smarthome_survilance',
  /** ISV */
  ISV = 'ISV',
  /** 智能媒资管理（多模态） */
  IntelligentMediaManagement = 'intelligent_media_management',
  /** 新媒体拍摄剪辑加速 */
  CloudMediaProduction = 'cloud_media_production',
  /** 数字人直播 */
  AvatarLive = 'avatar_live',
  /** VR直播/点播 */
  VrLive = 'vr_live',
  /** 统一消息触达 */
  Message = 'message',
  /** 七牛低代码平台 */
  Lowcode= 'lowcode'
}

/**
 * https://cf.qiniu.io/pages/viewpage.action?pageId=118244369
 */
export const nameMap = {
  [Solution.EnterpriseLive]: '企业直播/私域营销/企业培训',
  [Solution.InteractMarketing]: '互动营销',
  [Solution.EcommerceLive]: '电商直播',
  [Solution.ShortvideoMarketing]: '短视频点播营销',
  [Solution.MarketingPush]: '营销推送',
  [Solution.Image]: '图片存储分发处理解决方案',
  [Solution.Vod]: '视频点播',
  [Solution.InteractLive]: '互动直播',
  [Solution.KindergartenMonitoring]: '幼儿园监控',
  [Solution.SmarthomeSurvilance]: '智能家居&猫眼',
  [Solution.ISV]: 'ISV',
  [Solution.IntelligentMediaManagement]: '智能媒资管理（多模态）',
  [Solution.CloudMediaProduction]: '新媒体拍摄剪辑加速',
  [Solution.AvatarLive]: '数字人直播',
  [Solution.VrLive]: 'VR直播/点播',
  [Solution.Message]: '统一消息触达',
  [Solution.Lowcode]: '七牛低代码平台'
}

// 用于 router 匹配 URL pathname
export const basenameMap = {
  [Solution.EnterpriseLive]: '/enterprise-live',
  [Solution.InteractMarketing]: '/interact-marketing',
  [Solution.EcommerceLive]: '/ecommerce-live',
  [Solution.ShortvideoMarketing]: '/shortvideo-marketing',
  [Solution.MarketingPush]: '/marketing-push',
  [Solution.Image]: '/image',
  [Solution.Vod]: '/vod',
  [Solution.InteractLive]: '/interact-live',
  [Solution.KindergartenMonitoring]: '/kindergarten-monitoring',
  [Solution.SmarthomeSurvilance]: '/smarthome-survilance',
  [Solution.ISV]: '/isv',
  [Solution.IntelligentMediaManagement]: '/intelligent-media-management',
  [Solution.CloudMediaProduction]: '/cloud-media-production',
  [Solution.AvatarLive]: '/avatar-live',
  [Solution.VrLive]: '/vr-live',
  [Solution.Message]: '/message',
  [Solution.Lowcode]: '/lowcode'
}

export enum Category {
  /** 视频营销 */
  VideoMarketing = 'video_marketing',
  /** 社交互娱 */
  SocialEntertainment = 'social_entertainment',
  /** 视联网 */
  VideoInternetOfThings = 'video_internet_of_things',
  /** 智慧新媒体 */
  SmartMedia = 'smart_media',
  /** 元宇宙 */
  MetaUniverse = 'meta_universe',
}

/** 视频营销 */
export const categoryVideoMarketing = [
  Solution.EnterpriseLive,
  Solution.InteractMarketing,
  Solution.EcommerceLive,
  Solution.ShortvideoMarketing,
  Solution.MarketingPush
] as const

/** 社交互娱 */
export const categorySocialEntertainment = [
  Solution.Image,
  Solution.Vod,
  Solution.InteractLive
] as const

/** 视联网 */
export const categoryVideoInternetOfThings = [
  Solution.KindergartenMonitoring,
  Solution.SmarthomeSurvilance,
  Solution.ISV
] as const

/** 智慧新媒体 */
export const categorySmartMedia = [
  Solution.IntelligentMediaManagement,
  Solution.CloudMediaProduction
] as const

/** 元宇宙 */
export const categoryMetaUniverse = [
  Solution.AvatarLive,
  Solution.VrLive
] as const

export const categoryProductsMap = {
  [Category.VideoMarketing]: categoryVideoMarketing,
  [Category.SocialEntertainment]: categorySocialEntertainment,
  [Category.VideoInternetOfThings]: categoryVideoInternetOfThings,
  [Category.SmartMedia]: categorySmartMedia,
  [Category.MetaUniverse]: categoryMetaUniverse
} as const

export const categoryNameMap = {
  [Category.VideoMarketing]: '视频营销',
  [Category.SocialEntertainment]: '社交互娱',
  [Category.VideoInternetOfThings]: '视联网',
  [Category.SmartMedia]: '智慧新媒体',
  [Category.MetaUniverse]: '元宇宙'
} as const

export const categoryEnNameMap = {
  [Category.VideoMarketing]: 'Video Marketing',
  [Category.SocialEntertainment]: 'Social Entertainment',
  [Category.VideoInternetOfThings]: 'Video Internet Of Things',
  [Category.SmartMedia]: 'Smart Media',
  [Category.MetaUniverse]: 'Meta Universe'
} as const
