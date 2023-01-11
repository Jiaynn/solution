/**
 * @desc Bucket tag component.
 * @author hovenjay <hovenjay@outlook.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { useInjection } from 'qn-fe-core/di'

import { ITag } from 'kodo/apis/bucket/setting/tag'

import styles from './style.m.less'

interface BucketTagProps {
  tag: ITag
}

function copyFeedback(toasterStore: Toaster, prefix: string) {
  return (_: string, state: boolean) => {
    if (state) {
      toasterStore.info(prefix + '复制成功')
    } else {
      toasterStore.error(prefix + '复制失败')
    }
  }
}

const BucketTag = observer(
  ({ tag: { Key, Value } }: BucketTagProps) => {
    const toasterStore = useInjection(Toaster)

    return (
      <div className={styles.tag}>
        <CopyToClipboard onCopy={copyFeedback(toasterStore, '标签键')} text={Key}>
          <div className={styles.childTag} title={Key}>{Key}</div>
        </CopyToClipboard>
        <CopyToClipboard onCopy={copyFeedback(toasterStore, '标签值')} text={Value}>
          <div className={styles.childTag} title={Value}>{Value}</div>
        </CopyToClipboard>
      </div>
    )
  }
)

export default BucketTag
