/**
 * @file Input for domain pan bucket
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'

import TipIcon from 'cdn/components/TipIcon'

import { IBucketSimplified } from 'cdn/apis/bucket'
import DomainApis, { IDomainDetail } from 'cdn/apis/domain'
import DomainBucketInput, * as domainBucketInput from '../BucketInput'

import './style.less'

export type State = domainBucketInput.State

export type Value = domainBucketInput.Value

export function createState(
  bucket: string,
  options: {
    domainApis: DomainApis,
    modify?: boolean
    getDomains: () => IDomainDetail[]
  }
) {
  return domainBucketInput.createState(bucket, options)
}

export interface Props {
  buckets: IBucketSimplified[]
  domains: IDomainDetail[]
  hasIcp: boolean
  disabled: boolean
  state: State
}

export default observer(function DomainPanBucketInputWrapper(props: Props) {
  return (
    <div className="domain-pan-bucket-input-wrapper">
      <DomainBucketInput {...props} />
    </div>
  )
})

export function DomainPanBucketInputLabel() {
  const tip = '当泛域名源站不是七牛云存储时，泛子域名只支持选择公有空间；当泛域名源站为七牛云存储时，泛子域名只能和泛域名同时选择公有空间或私有空间。'
  return (
    <>
      空间 <TipIcon tip={tip} />
    </>
  )
}

