/**
 * @file test cases for component SSLRenewal
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'

import { RendererUtils as Renderer } from '../../utils/test'
import ApplyState from '../../stores/apply-state'
import SslApis from '../../apis/ssl'
import { ProductShortName, SSLDomainType } from '../../constants/ssl'

import SSLRenewal from '.'

it('renders correctly', () => {
  const renderer = new Renderer()

  const SSLRenewalWrap = observer(function _SSLRenewalWrap() {
    const sslApis = useInjection(SslApis)
    const applyState = new ApplyState(sslApis)
    applyState.updateCurrentValues({
      product_short_name: ProductShortName.GeoTrustOV,
      years: 1,
      limit: 0,
      wildcard_limit: -1,
      product_type: SSLDomainType.Single
    })
    applyState.initOptionsByCurrentValues()

    return <SSLRenewal orderid="123" applyState={applyState} />
  })
  const tree = renderer
    .create(<SSLRenewalWrap />)
    .toJSON()
  expect(tree).toMatchSnapshot()
})
