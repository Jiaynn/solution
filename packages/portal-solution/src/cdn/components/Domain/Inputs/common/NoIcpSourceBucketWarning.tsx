/**
 * @file SourceBucketWarning Component
 * @description 针对未备案域名，用户选择切换覆盖区为 “海外” 时，检测该域名绑定的源站 bucket 是否为国内 bucket，如果为国内 bucket 显示提示
 * @author hejinxin <hejinxin@qiniu.com>
 */

import React from 'react'

export default function NoIcpSourceBucketWarning(props: { desc?: React.ReactNode}) {
  return (
    <div className="comp-source-bucket-warning">
      <span className="warning-text">未备案域名使用海外加速不能使用国内 Bucket, </span>
      <span className="warning-desc">{props.desc || '请将源站更换至海外 Bucket 后再切换覆盖区域'}</span>
    </div>
  )
}
