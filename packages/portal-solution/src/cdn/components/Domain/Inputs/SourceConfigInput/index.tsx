/**
 * @file 域名源站配置
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'

import { IDomainDetail } from 'cdn/apis/domain'
import SourceConfigInputForBatch, { Props as SourceConfigInputForBatchProps } from './ForBatch'

export { getDefaultSourceConfig, ISourceConfig, createState, getValue, State } from './ForBatch'
export { getDefaultSourceHost, ISourceHost } from './SourceHostInput'

export interface IDomainSourceConfigInputProps extends Omit<SourceConfigInputForBatchProps, 'domains'> {
  domain: IDomainDetail
}

export default observer(function DomainSourceConfigInput(props: IDomainSourceConfigInputProps) {
  const { domain, ...restProps } = props

  return (
    <SourceConfigInputForBatch domains={[domain]} {...restProps} />
  )
})
