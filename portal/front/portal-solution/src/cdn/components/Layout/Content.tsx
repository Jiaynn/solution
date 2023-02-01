/**
 * @file component Layout
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React, { ReactNode } from 'react'
import PopupContainer from 'react-icecream/lib/popup-container'
import { useInjection } from 'qn-fe-core/di'
import { Iamed } from 'portal-base/user/iam'
import { nonExpUserRequired } from 'portal-base/user/account'
import registerPermission from 'portal-base/common/utils/permission'
import { ContentLayoutScaffold } from 'portal-base/common/components/Layout'

import IamInfo from 'cdn/constants/iam-info'

import { sideModalRoot } from 'cdn/components/common/SideModal'

export interface Props {
  sidebar: ReactNode
  children: ReactNode
}

function Content(props: Props) {
  const { sidebar, children } = props
  const { iamService } = useInjection(IamInfo)

  return (
    <>
      <Iamed product={iamService}>
        <ContentLayoutScaffold sidebar={sidebar}>
          <PopupContainer className="main-popup-container">
            {children}
          </PopupContainer>
        </ContentLayoutScaffold>
      </Iamed>
      <div className={sideModalRoot} />
    </>
  )
}

export default registerPermission(nonExpUserRequired)(Content)
