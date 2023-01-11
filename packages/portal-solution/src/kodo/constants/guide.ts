/**
 * @file constants for Guide
 * @author Surmon <i@surmon.me>
 */

import { ObjectManagerRole, TaskCenterRole } from 'kodo-base/lib/constants/role'

import { BucketRole, BucketSettingRole } from 'kodo/constants/role'

import { IStep } from 'kodo/components/common/Guide/Group'

export const bucketListGuideName = 'bucket-list'
export const bucketListGuideSteps: IStep[] = [
  {
    roleSelector: `${BucketRole.CreateBucketEntry}`,
    content: '上传文件之前，需要先创建一个存储空间'
  },
  {
    roleSelector: `${BucketRole.BucketListTypeFilterCtrl}`,
    content: '可进行空间筛选，只查看授权空间，或是只查看自有空间等'
  }
]

export const bucketFileGuideName = 'bucket-file'
export const bucketFileGuideSteps: Array<IStep<ObjectManagerRole>> = [
  {
    roleSelector: 'upload-file-entry',
    content: '点击这里，批量上传文件'
  },
  {
    roleSelector: 'create-folder',
    content: '点击这里，创建目录'
  },
  {
    roleSelector: 'object-detail',
    content: '点击详情可以预览文件，查看、添加和修改文件元数据信息'
  },
  {
    roleSelector: 'move-paste',
    content: '可以到指定目录或空间下（不得跨区域）粘贴所选文件'
  }
]

export const bucketSettingGuideName = 'bucket-setting'
export const bucketSettingGuideSteps = [
  {
    roleSelector: `${BucketSettingRole.Referrer}`,
    content: '开启空间的 Referer 防盗链验证，防止数据盗用'
  },
  {
    roleSelector: `${BucketSettingRole.CrossOrigin}`,
    content: '设置规则以解决浏览器的跨域访问问题'
  },
  {
    roleSelector: `${BucketSettingRole.Event}`,
    content: '设置规则以获取指定资源操作的消息推送'
  }
]

export const taskCenterGuideName = 'task-center'
const taskCenterUploadSteps = [
  {
    roleSelector: 'upload-persistent-id',
    content: '点击查看、复制转码任务 ID'
  }
]
const taskCenterBaseSteps: Array<IStep<TaskCenterRole>> = [
  {
    roleSelector: 'entry',
    content: '点击这里，查看任务状态'
  }
]

export const taskCenterSteps = [
  ...taskCenterBaseSteps,
  ...taskCenterUploadSteps
]
