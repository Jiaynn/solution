/**
 * @file 域名图片处理配置
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { bindSwitch } from 'portal-base/common/form'

import Switch from '../common/Switch'

import './style.less'

export interface IFopConfig {
  enableFop: boolean
}

export function getDefaultFopConfig(): IFopConfig {
  return {
    enableFop: false
  }
}

function FopDescTable() {
  return (
    <table className="fop-desc-table">
      <thead>
        <tr>
          <th>图片处理功能</th>
          <th>描述</th>
          <th>价格</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><a href="http://developer.qiniu.com/code/v6/api/kodo-api/image/imageview2.html" target="_blank" rel="noopener noreferrer">图片基本处理(imageView2)</a></td>
          <td>为图片生成各种缩略图。</td>
          <td rowSpan={5}>每月 0-20 TB 免费<br />20 TB 以上：0.025 元/GB</td>
        </tr>
        <tr>
          <td><a href="http://developer.qiniu.com/code/v6/api/kodo-api/image/imagemogr2.html" target="_blank" rel="noopener noreferrer">图片高级处理(imageMogr2)</a></td>
          <td>对图片进行缩放、裁剪、旋转等。</td>
        </tr>
        <tr>
          <td><a href="http://developer.qiniu.com/code/v6/api/kodo-api/image/imageinfo.html" target="_blank" rel="noopener noreferrer">图片基本信息(imageInfo)</a></td>
          <td>获取图片格式、大小、色彩模型等基本信息。</td>
        </tr>
        <tr>
          <td><a href="http://developer.qiniu.com/code/v6/api/kodo-api/image/exif.html" target="_blank" rel="noopener noreferrer">图片 EXIF 信息(exif)</a></td>
          <td>获取图片的 EXIF 格式。</td>
        </tr>
        <tr>
          <td><a href="http://developer.qiniu.com/code/v6/api/kodo-api/image/watermark.html" target="_blank" rel="noopener noreferrer">图片水印处理(watermark)</a></td>
          <td>对图片打图片、文字水印。</td>
        </tr>
        <tr>
          <td><a href="http://developer.qiniu.com/code/v6/api/kodo-api/image/imageave.html" target="_blank" rel="noopener noreferrer">图片主色调(imageAve)</a></td>
          <td>计算图片的平均色调。</td>
          <td>0.1 元/千次</td>
        </tr>
      </tbody>
    </table>
  )
}

export type State = FieldState<boolean>

export type Value = IFopConfig

export function createState(conf: IFopConfig): State {
  return new FieldState(conf.enableFop)
}

export function getValue(state: State): Value {
  return {
    enableFop: state.value
  }
}

export default observer(function DomainFopConfigInput({ state }: {
  state: State
}) {
  return (
    <div className="domain-fop-config-input-wrapper">
      <div className="line">
        <FopDescTable />
      </div>
      <p className="line">注：域名源站非七牛空间也可使用该功能。</p>
      <div className="line">
        <Switch {...bindSwitch(state)} />
      </div>
    </div>
  )
})
