/**
 * @desc Bucket tags popover.
 * @author hovenjay <hovenjay@outlook.com>
 */

import React, { useRef, useEffect, useCallback } from 'react'
import { Modal } from 'react-icecream'
import { observer } from 'mobx-react'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { useInjection } from 'qn-fe-core/di'

import { valuesOf } from 'kodo/utils/ts'

import { DomainApis } from 'kodo/apis/domain'

import OwnerVerification from './OwnerVerification'
import styles from './style.m.less'

interface RetrieveDomainModalProps {
  domain: string
  visible: boolean

  onCancel(): void
}

enum Loading {
  UnbindDomain = 'UnbindDomain'
}

const RetrieveDomainModal = observer(
  ({ domain, visible, onCancel }: RetrieveDomainModalProps) => {
    const domainApis = useInjection(DomainApis)
    const loadings = useRef(new Loadings(...valuesOf(Loading)))

    useEffect(() => (() => loadings.current && loadings.current.dispose()), [])

    const toasterStore = useInjection(Toaster)

    const handleUnbindDomain = useCallback(async () => {
      const req = domainApis.unbindBucketDomain(domain)
      loadings.current.promise(Loading.UnbindDomain, req)
      toasterStore.promise(req, '解绑成功')
      await req
      onCancel()
    }, [domain, domainApis, onCancel, toasterStore])

    if (!domain) { return null }

    return (
      <Modal
        title="域名找回"
        visible={visible}
        onOk={handleUnbindDomain}
        onCancel={onCancel}
        okText="我已添加 TXT 验证记录，提交"
        okButtonProps={{ loading: loadings.current.isLoading(Loading.UnbindDomain) }}
      >
        域名 <strong>{domain}</strong> 已经被其他用户绑定！<br />
        您可通过验证域名所有权的方式来强制解除该域名的绑定记录。<br />
        请登录域名提供商提供的域名管理界面，在待找回域名下添加如下<strong>&nbsp;TXT 记录&nbsp;</strong>：
        <OwnerVerification domain={domain} />
        <span className={styles.warning}>注意：解除域名绑定记录，可能导致原本绑定该域名的空间无法通过该域名访问，请谨慎操作。</span>
      </Modal>
    )
  }
)

export default RetrieveDomainModal
