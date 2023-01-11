/**
 * @file bindDomain component
 * @description 为空间绑定域名的弹窗
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import { Button } from 'react-icecream/lib'

import Role from 'portal-base/common/components/Role'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { RegionSymbol } from 'kodo/constants/region'
import { BucketDomainRole } from 'kodo/constants/role'

import { Auth } from 'kodo/components/common/Auth'

import BoundDomainModal from './BoundDomainModal'

export interface IProps extends IDetailsBaseOptions {
  domain?: string // 域名
  region: RegionSymbol
}

@observer
class BoundDomain extends React.Component<IProps> {
  @observable boundModalVisible = false

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @action.bound
  updateBoundModalVisible(visible: boolean) {
    this.boundModalVisible = visible
  }

  renderBoundButton(disabled: boolean) {
    return (
      <Role name={BucketDomainRole.BindSourceDomainEntry}>
        <Button
          icon="plus"
          type="primary"
          disabled={disabled}
          onClick={() => this.updateBoundModalVisible(true)}
        >
          绑定域名
        </Button>
      </Role>
    )
  }

  render() {
    return (
      <Auth
        notProtectedUser
        render={disabled => (
          <>
            {!disabled && (
              <BoundDomainModal
                region={this.props.region}
                visible={this.boundModalVisible}
                bucketName={this.props.bucketName}
                onClose={() => this.updateBoundModalVisible(false)}
              />
            )}
            {this.renderBoundButton(disabled)}
          </>
        )}
      />
    )
  }
}

export default BoundDomain
