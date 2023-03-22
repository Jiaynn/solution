import React from 'react'
import classNames from 'classnames'
import { SettingIcon } from 'react-icecream-2/icons'
import { useInjection } from 'qn-fe-core/di'
import { UserInfoStore } from 'portal-base/user/account'
import { Dropdown, Menu, MenuItem } from 'react-icecream-2'

import IconBackPNG from './icon-back.png'

import './style.less'

const prefixCls = 'lowcode-header'

interface Props {
  className?: string
  style?: React.CSSProperties
}

export const LowCodeHeader: React.FC<Props> = props => {
  const { className, style } = props
  const userInfoStore = useInjection(UserInfoStore)

  const onLogOut = () => {
    userInfoStore.signOutAndGoSignIn(window.location.href)
  }

  return (
    <div className={classNames(prefixCls, className)} style={style}>
      <Dropdown overlay={<Menu style={{ width: '160px' }}>
        <MenuItem onClick={onLogOut}>
          <img className={`${prefixCls}-icon-back`} src={IconBackPNG} alt="IconBackPNG" />
          <span>退出账号</span>
        </MenuItem>
      </Menu>}
      >
        <span className={`${prefixCls}-setting`}>
          <span className={`${prefixCls}-setting-name`}>{userInfoStore.full_name || userInfoStore.email}</span>
          <SettingIcon />
        </span>
      </Dropdown>
    </div>
  )
}
