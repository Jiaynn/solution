/**
 * @file operators of card footer
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { Button } from 'react-icecream/lib'

import Role from 'portal-base/common/components/Role'

import { BucketSettingRole } from 'kodo/constants/role'

import { Auth } from 'kodo/components/common/Auth'
import { injectMainBtnClickHookProps } from './sensors'
// import styles from './style.less'

export interface IProps {
  // 不用 loading 是因为这个只针对 submit / ok 按钮（而不是整个容器）而这里可以有多个按钮
  isSubmitting?: boolean
  onSubmit?(): any
  submitBtnVisible?: boolean
  submitBtnSensorsHook?: string
}

export default observer(function _CardFooter(props: IProps) {
  const submitBtnVisible = props.submitBtnVisible == null || !!props.submitBtnVisible
  // TODO: 样式 @huangbinjie
  return (
    <div>
      {submitBtnVisible && (
        <Auth
          notProtectedUser
          render={disabled => (
            <Role name={BucketSettingRole.BlockConfirmCtrl}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={disabled}
                // TODO: check: 很多人 submit 和 onClick 和 Form 一起用导致 toaster 了两次
                // 也因此 onSubmit 不能简单用于代替 submitBtnVisible
                onClick={props.onSubmit}
                loading={props.isSubmitting}
                {...injectMainBtnClickHookProps(props.submitBtnSensorsHook)}
              >
                确定
              </Button>
            </Role>
          )}
        />
      )}
      {/* TODO: 不做取消重置？ <Button size="m">取消</Button> */}
    </div>
  )
})
