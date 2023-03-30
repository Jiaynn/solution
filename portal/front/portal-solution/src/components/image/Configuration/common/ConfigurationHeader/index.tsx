import React from 'react'
import classNames from 'classnames'
import { Divider, Steps } from 'react-icecream'

import logoPNG from './logo.png'

import './style.less'

const prefixCls = 'comp-configuration-header'

export interface ConfigurationHeaderProps {
  className?: string
  style?: React.CSSProperties
  /**
   * 当前步骤
   */
  current?: number;
  /**
   * 是否显示步骤
   */
  stepsVisible?: boolean;
}

const { Step } = Steps

const steps = [
  {
    title: '存储空间配置',
    description: '提供默认存储服务，支持多存储地址管理'
  },
  {
    title: '加速域名配置',
    description:
      '为空间绑定自定义 CDN 加速域名，通过 CDN 边缘节点缓存数据，提高存储空间内的文件访问响应速度。'
  },
  {
    title: '图片处理配置',
    description: '自定义图片处理服务，支持加速、裁剪及水印等配置'
  }
] as const

const guides = [
  {
    title: '存储空间管理',
    content:
      '下方列表展示专属空间，可以点击「操作」栏中的「概览」可以查看空间的详细信息'
  },
  {
    title: '自定义CDN加速域名',
    content:
      '为空间绑定自定义CDN加速域名，通过CDN边缘节点缓存数据，提高存储空间内的文件访问响应速度'
  },
  { title: '图片样式处理配置', content: '' }
] as const

export const ConfigurationHeader: React.FC<ConfigurationHeaderProps> = props => {
  const {
    className, style,
    current = 0, stepsVisible = false
  } = props

  const currentGuide = guides[current - 1]

  return (
    <div className={classNames(prefixCls, className)} style={style}>
      <div className={`${prefixCls}-main`}>
        <img className={`${prefixCls}-main-img`} src={logoPNG} alt="logo" />
        <div className={`${prefixCls}-main-text`}>
          <div className={`${prefixCls}-main-text-title`}>图片存储分发处理解决方案</div>
          <div
            className={`${prefixCls}-main-text-content`}
          >针对有海量用户生成内容的场景。七牛云存储服务的高并发能力使您灵活应对大流量的业务场景。您可以对存储在云端的图片文件进行数据处理。</div>
        </div>
      </div>

      {
        stepsVisible && <div className={`${prefixCls}-steps`}>
          <div className={`${prefixCls}-steps-title`}>配置向导</div>
          <Steps className={`${prefixCls}-steps-steps`} current={current - 1}>
            {steps.map((stepItem, index) => (
              <Step {...stepItem} className={`${prefixCls}-steps-step`} key={index} />
            ))}
          </Steps>
        </div>
      }

      {
        currentGuide && <div className={`${prefixCls}-description`}>
          <div className={`${prefixCls}-description-title`}>
            {currentGuide.title}
          </div>
          <Divider className={`${prefixCls}-description-divider`} />
          <div className={`${prefixCls}-description-content`}>
            {currentGuide.content}
          </div>
        </div>
      }
    </div>
  )
}
