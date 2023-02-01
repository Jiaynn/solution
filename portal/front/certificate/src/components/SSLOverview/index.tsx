/*
 * @file component SSLOverview
 * @author Yao Jingtian <yncst233@gmail.com>
 */

import React from 'react'
import { observable, action } from 'mobx'
import { observer } from 'mobx-react'

import Button from 'react-icecream/lib/button'
import Modal from 'react-icecream/lib/modal'
import Tabs from 'react-icecream/lib/tabs'
import Icon from 'react-icecream/lib/icon'
import Tooltip from 'react-icecream/lib/tooltip'

import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import Store, { observeInjectable } from 'qn-fe-core/store'
import { RouterStore } from 'portal-base/common/router'
import { useTranslation } from 'portal-base/common/i18n'

import PageWithBreadcrumb from '../Layout/PageWithBreadcrumb'
import UploadCertForm from './UploadCertForm'
import HelpLink from '../common/HelpLink'
import OEMDisabled from '../common/OEMDisabled'
import { basename } from '../../constants/app'
import { isOEM } from '../../constants/env'
import Cert from './Cert'
import CertStore from './Cert/store'
import Order from './Order'
import Info from './Info'

import * as messages from './messages'

import './style.less'

// 导航栏
export const tabItems = [
  {
    to: '/order',
    label: '我的订单'
  },
  {
    to: '/cert',
    label: '我的证书'
  },
  {
    to: '/info',
    label: '我的信息'
  }
]

export default observer(function _Overview() {
  const certStore = useLocalStore(CertStore)
  const store = useLocalStore(OverviewStore)
  const routerStore = useInjection(RouterStore)
  const t = useTranslation()

  const productTip = <HelpLink href="https://developer.qiniu.com/ssl">产品文档</HelpLink>

  return (
    <PageWithBreadcrumb sideItems={productTip}>
      <div className="comp-cert-list">
        <div className="list-content-wrapper">
          <div className="cert-action">
            <OEMDisabled>
              <Button type="primary" onClick={() => routerStore.push(`${basename}/apply`)}>购买证书</Button>
            </OEMDisabled>
            <Button onClick={() => store.toggleUploadLightbox()}>{t(messages.uploadSelfCert)}</Button>
          </div>
          {
            isOEM
            ? <Cert store={certStore} />
            : (
              <Tabs animated={false}
                defaultActiveKey={store.activeKey}
                onChange={activeKey => store.handleTabChange(activeKey)}
              >
                <Tabs.TabPane tab="我的订单" key="/order" >
                  <Order />
                </Tabs.TabPane>
                <Tabs.TabPane tab="我的证书" key="/cert" >
                  <Cert store={certStore} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  key="/info"
                  tab={
                    <span>我的信息
                      <Tooltip title="管理公司/联系人信息用于购买证书时补全信息">
                        <Icon className="info-tip" type="info-circle" />
                      </Tooltip>
                    </span>
                  }
                >
                  <Info />
                </Tabs.TabPane>
              </Tabs>
            )
          }
        </div>
        <Modal
          title="上传原有证书"
          visible={store.uploadLightbox.visible}
          onCancel={() => store.toggleUploadLightbox()}
          footer={null}
          width="80%"
        >
          <div className="upload-cert-lightbox-form-wrap">
            <UploadCertForm
              onUploaded={() => {
                store.toggleUploadLightbox()
                certStore.refreshCerts()
              }}
              onCancel={() => {
                store.toggleUploadLightbox()
                certStore.refreshCerts()
              }}
            />
          </div>
        </Modal>
      </div>
    </PageWithBreadcrumb>
  )
})

@observeInjectable()
class OverviewStore extends Store {
  constructor(
    private routerStore: RouterStore
  ) {
    super()
  }

  @observable activeKey = this.routerStore.location?.hash ? `/${this.routerStore.location.hash.substr(1)}` : '/order'

  @observable uploadLightbox = {
    visible: false,
    memoName: '',
    secret_key: '',
    public_key: ''
  }

  @action updateActiveKey(name: string) {
    this.activeKey = name
  }

  @action toggleUploadLightbox() {
    this.uploadLightbox.visible = !this.uploadLightbox.visible
  }

  handleTabChange(tab: string) {
    switch (tab) {
      case '/order': {
        this.updateActiveKey('#order')
        window.location.hash = this.activeKey
        break
      }
      case '/cert': {
        this.updateActiveKey('#cert')
        window.location.hash = this.activeKey
        break
      }
      case '/info': {
        this.updateActiveKey('#info')
        window.location.hash = this.activeKey
        break
      }
      default:
    }
  }

}
