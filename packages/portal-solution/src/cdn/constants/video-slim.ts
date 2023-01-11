export const SERVICE_NAME = 'fusion@qiniu.com'

export enum TaskState {
  SlimWaiting = 'slimwaiting',
  SlimProcessing = 'slimprocessing',
  SlimSuccess = 'slimsuccess',
  SlimFailed = 'slimfailed',
  Enabled = 'enabled',
  Stopping = 'stopping',
  Enabling = 'enabling',
  Deleted = 'deleted'
}

export const taskStateTextMap = {
  [TaskState.SlimWaiting]: '等待瘦身',
  [TaskState.SlimProcessing]: '瘦身中',
  [TaskState.SlimSuccess]: '瘦身成功',
  [TaskState.SlimFailed]: '瘦身失败',
  [TaskState.Enabled]: '已启用',
  [TaskState.Stopping]: '停用中',
  [TaskState.Enabling]: '启用中',
  [TaskState.Deleted]: '已删除'
}

export enum VideoDef { // 视频规格
  SD = 'sd',
  HD = 'hd',
  TwoK = '2k',
  Invalid = 'invalid'
}

export const videoDefDescTextMap = {
  [VideoDef.SD]: '1080*720 及以下',
  [VideoDef.HD]: '1920*1080',
  [VideoDef.TwoK]: '2560*1440',
  [VideoDef.Invalid]: '未知'
}
