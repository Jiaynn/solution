import React from 'react'
import { observer } from 'mobx-react'
import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import Button from 'react-icecream/lib/button'
import Spin from 'react-icecream/lib/spin'
import Page from 'portal-base/common/components/Page'
import { useLocalStore } from 'portal-base/common/utils/store'

import { isQiniu } from 'cdn/constants/env'

import LocalStore from './store'

import './style.less'

export default observer(function DomainConflict() {
  const store = useLocalStore(LocalStore)

  // 与泛域名冲突时才需要额外展示待验证域名信息
  const findDomainView = (
    store.conflictWithWildcardDomain
    ? (
      <Row>
        <Col span={8} className="validate-info-label">待验证域名</Col>
        <Col span={16} className="validate-info-value">{store.findDomain}</Col>
      </Row>
    )
    : null
  )

  const validateInfo = (
    <Row align="top" className="conflict-validate-section">
      <Col span={4} className="validate-label">
        <label>验证信息</label>
      </Col>
      <Col span={14} className="validate-content">
        <Spin spinning={store.isLoading}>
          <p className="validate-describe">
            域名 <strong>{ store.domain }</strong> 与其他账号下的 <strong>{ store.conflictDomain }</strong> 冲突，
            如发起找回，找回成功后 { store.conflictDomain } 会转移至当前账号下，如果账期未过该域名当前账期产生的费用也会计算到新账号下
          </p>
          <div className="validate-info">
            <Row>
              <Col span={8} className="validate-info-label">待找回域名</Col>
              <Col span={16} className="validate-info-value">{store.conflictDomain}</Col>
            </Row>
            {findDomainView}
            <Row>
              <Col span={8} className="validate-info-label">下载文件</Col>
              <Col span={16} className="validate-info-value">
                { store.fileName }
                <a href="#!" onClick={store.downloadFile}> (点击下载文件)</a>
              </Col>
            </Row>
          </div>
        </Spin>
      </Col>
    </Row>
  )

  const notices = (
    <Row align="top" className="conflict-validate-section">
      <Col span={4} className="validate-label">
        <label>注意事项</label>
      </Col>
      <Col span={14} className="validate-content">
        <p className="validate-describe">
          1. 请下载此验证文件后并尽快上传到待验证域名 {store.findDomain} 的根目录下，然后点击提交按钮验证<br />
          2. 请确保待验证域名能正常访问，以免验证不通过<br />
          3. 系统将会直接请求您的验证文件，请不要使用任何跳转重定向，以免验证不通过<br />
          4. 超时时间为 8 小时，超时不验证会置为验证失败<br />
          5. 如果当前的域名正在找回，无法重复发起找回申请<br />
          {isQiniu && <><span>6. 源站为 七牛云存储的域名在找回后会自动降级为 HTTP 协议，请找回后重新配置 HTTPS 证书</span><br /></>}
          {isQiniu && <span className="highlight">7. 源站为 七牛云存储 的域名找回会导致服务中断，如需避免服务中断，请联系技术支持操作</span>}
        </p>
      </Col>
    </Row>
  )

  let hintMsg = ''
  if (store.verifyResult === 'success') {
    hintMsg = `验证通过，${store.conflictDomain} 找回处理中，预计6-8小时，请稍后查看。`
  } else {
    hintMsg = store.verifyResult === 'error' ? '验证未通过，请确认上传正确文件后重试。' : ''
  }

  const hint = (
    <div className={`hint ${store.verifyResult}`}>
      {hintMsg}
    </div>
  )

  return (
    <Page className="domain-conflict-wrapper">
      <div className="domain-conflict-content">
        { validateInfo }
        { notices }
        <Row justify="end" className="domain-conflict-footer">
          <Col span={8} offset={16}>
            <Button type="primary"
              disabled={store.isLoading}
              loading={store.isSubmitting}
              onClick={() => store.submitVerify()}
            >
              提交验证
            </Button>
            { hint }
          </Col>
        </Row>
      </div>
    </Page>
  )
})
