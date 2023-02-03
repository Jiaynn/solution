/**
 * @file Auth Value Item Component
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import ToolTip from 'react-icecream/lib/tooltip'

import CopyContent from '../CopyContent'
import { AuthMethodType, DnsRecordType, dnsRecordTypeTextMap } from '../../../constants/domain'

export interface Props {
  authValue: string
  authMethod: AuthMethodType
  recordType?: DnsRecordType
}

export default function AuthValueItem({ authValue, authMethod, recordType }: Props) {
  return (
    <div>
      {humanizeAuthValueLabel(authMethod, recordType)}
      <ToolTip overlayStyle={{ whiteSpace: 'pre-wrap', fontSize: '12px' }} title={authValue}>
        <span><CopyContent title="复制" content={authValue} /></span>
      </ToolTip>
    </div>
  )
}

function humanizeAuthValueLabel(authMethod: AuthMethodType, recordType?: DnsRecordType) {
  let key = ''
  switch (authMethod) {
    case AuthMethodType.Dns: {
      key = `${dnsRecordTypeTextMap[recordType!]}值`
      break
    }
    case AuthMethodType.File: {
      key = '验证文件值'
      break
    }
    case AuthMethodType.DnsProxy: {
      key = 'CNAME 记录值'
      break
    }
    default: {
      throw Error('Unknown authMethod: ' + authMethod)
    }
  }
  return key + '：'
}
