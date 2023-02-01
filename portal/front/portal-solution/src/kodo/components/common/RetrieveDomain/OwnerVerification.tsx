/**
 * @desc Domain owner verify.
 * @author hovenjay <hovenjay@outlook.com>
 */

import React, { ReactNode } from 'react'
import { Typography } from 'react-icecream'
import { observer } from 'mobx-react'

import { generateOwnerVerificationData } from 'kodo/transforms/domain'

import Prompt from '../Prompt'
import styles from './style.m.less'

interface OwnerVerificationProps {
  domain: string
}

const { Paragraph } = Typography

const DescriptionItem = observer(({ label, children }: { label: string, children: ReactNode }) => (
  <div className={styles.item}>
    <label className={styles.label}>{label}</label>
    <span className={styles.value}>{children}</span>
  </div>
))

const OwnerVerification = observer(({ domain }: OwnerVerificationProps) => {
  const { rootDomain, token, host } = generateOwnerVerificationData(domain)

  return (
    <Prompt className={styles.description} type="assist">
      <DescriptionItem label="域名：">
        <Paragraph>{rootDomain}</Paragraph>
      </DescriptionItem>
      <DescriptionItem label="主机记录：">
        <Paragraph copyable>{token}</Paragraph>
      </DescriptionItem>
      <DescriptionItem label="记录值：">
        <Paragraph copyable>{host}</Paragraph>
      </DescriptionItem>
    </Prompt>
  )
})

export default OwnerVerification
