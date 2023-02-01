/**
 * @file component FullSelector
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react-lite'
import { FieldState } from 'formstate-x'
import { useInjection } from 'qn-fe-core/di'

import Checkbox from 'react-icecream/lib/checkbox'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import { bindCheckbox } from 'portal-base/common/form'
import { useTranslation } from 'portal-base/common/i18n'

import Links from 'cdn/constants/links'
import { isQiniu } from 'cdn/constants/env'

import HelpLink from 'cdn/components/common/HelpLink'

const messages = {
  maxDomainTip: {
    cn: (showFullCheck: boolean, max: number) => (
      showFullCheck
        ? `注：此列表最多包含 ${max} 个域名，如要查看所有域名请勾选下方全量域名`
        : `注：此列表最多包含 ${max} 个域名，如需更多，请使用搜索`
    ),
    en: (showFullCheck: boolean, max: number) => (
      showFullCheck
        ? `Note: this list contains at most ${max} domain names. To view all domain names, please check the full number of domain names below.`
        : `Note: this list contains at most ${max} domain names. For more, please use search.`
    )
  },
  fullDomain: {
    cn: '全量域名',
    en: 'All'
  }
}

export interface IProps {
  state: FieldState<boolean>
  total: number
  maxDomainCount: number
  showFullCheck?: boolean
}

export default observer(function _FullSelector(props: IProps) {
  const links = useInjection(Links)
  const t = useTranslation()

  let tips = ''
  if (props.total > props.maxDomainCount) {
    tips = t(messages.maxDomainTip, props.showFullCheck, props.maxDomainCount)
  }

  if (!props.showFullCheck && !tips) {
    return null
  }

  return (
    <section className="comp-full-selector">
      <div className="tips">
        {tips}
      </div>
      {props.showFullCheck && (
        <div className="selector">
          <Checkbox
            {...bindCheckbox(props.state)}
          >
            {t(messages.fullDomain)}
          </Checkbox>
          {isQiniu && (
            <Tooltip
              title={
                <div>
                  “全量域名”统计规则&nbsp;
                  <HelpLink href={links.trafficStatistics}>点击查看</HelpLink>
                </div>
              }
              overlayClassName="info-tip"
            >
              <Icon type="question-circle" className="info-icon" />
            </Tooltip>
          )}
        </div>
      )}
    </section>
  )
})
