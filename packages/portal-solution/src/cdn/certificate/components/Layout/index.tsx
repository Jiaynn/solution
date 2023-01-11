/*
 * @file component Layout
 * @author nighca <nighca@live.cn>
 */

import React, { PropsWithChildren } from 'react'
import { observer } from 'mobx-react'
import PopupContainer from 'react-icecream/lib/popup-container'
import BaseLayout, { ContentLayoutScaffold } from 'portal-base/common/components/Layout'

import './style.less'

export default observer(function Layout(props: PropsWithChildren<{}>) {
  return (
    <BaseLayout>
      <ContentLayoutScaffold>
        <PopupContainer className="main-popup-container">
          {props.children}
        </PopupContainer>
      </ContentLayoutScaffold>
    </BaseLayout>
  )
})
