/**
 * @file CDN 概览页
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import Page from 'portal-base/common/components/Page'
import { IamDisabled, Iamed } from 'portal-base/user/iam'

import IamInfo from 'cdn/constants/iam-info'

import OEMDisabled from 'cdn/components/common/OEMDisabled'

import Statistics from './components/Statistics'
import TopDomains from './components/TopDomains'
import Domain from './components/Domain'
import Buy from './components/Buy'
import Certificate from './components/Certificate'
import FAQ from './components/FAQ'

import './style.less'

export interface IProps {
  /**
   * 隐藏右侧栏
   */
  hideAddon?: boolean
}

export default function Overview(props: IProps) {
  const { iamActions } = useInjection(IamInfo)

  return (
    <Iamed actions={[iamActions.Dashboard]}>
      <Page className="comp-overview" hasBackground={false} hasSpace={false}>
        <div className="overview-content">
          <div className="main">
            <Statistics />
            <TopDomains />
          </div>
          {!props.hideAddon && (
            <OEMDisabled>
              <div className="additional">
                <Domain />
                <Buy />
                <IamDisabled>
                  <Certificate />
                </IamDisabled>
                <FAQ />
              </div>
            </OEMDisabled>
          )}
        </div>
      </Page>
    </Iamed>
  )
}
