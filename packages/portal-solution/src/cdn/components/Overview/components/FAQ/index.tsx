/**
 * @file 常见问题
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { DocumentPopupStore } from 'portal-base/common/components/Document'

import Card from '../Card'

import './style.less'

const faqData = [
  {
    name: '域名接入流程',
    url: 'https://developer.qiniu.com/fusion/4939/the-domain-name-to-access'
  },
  {
    name: '如何进行 CNAME 配置',
    url: 'https://developer.qiniu.com/fusion/4941/cname-configuration'
  },
  {
    name: 'CDN 产品价格说明',
    url: 'https://developer.qiniu.com/fusion/6843/cdn-product-pricing'
  },
  {
    name: '刷新预取使用说明',
    url: 'https://developer.qiniu.com/fusion/3845/refresh-the-prefetch-fusion'
  },
  {
    name: 'CDN 用量查询及日志统计分析',
    url: 'https://developer.qiniu.com/fusion/3846/data-statistics-fusion'
  },
  {
    name: '常见内容访问控制配置',
    url: 'https://developer.qiniu.com/fusion/4960/access-control-configuration'
  },
  {
    name: '如何进行 HTTPS 配置',
    url: 'https://developer.qiniu.com/fusion/4952/https-configuration'
  },
  {
    name: '如何使用告警服务',
    url: 'https://developer.qiniu.com/fusion/7093/CDN-the-alarm-service'
  }
]

export default observer(function FAQ() {
  const documentPopupStore = useInjection(DocumentPopupStore)

  const openFAQLink = (url: string) => {
    documentPopupStore.show(url)
  }

  return (
    <Card className="comp-overview-faq" title="常见问题">
      <ul className="faq-list">
        {faqData.map((faq, index) => (
          <li key={index} className="faq-item">
            <a onClick={() => openFAQLink(faq.url)}>
              {faq.name}
            </a>
          </li>
        ))}
      </ul>
    </Card>
  )
})
