/**
 * @file Bucket setting referrer component
 * @description Bucket setting referrer
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { observable, action, makeObservable } from 'mobx'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'
import ReferrerCard from './Card'
import ReferrerForm from './Form'

export interface IProps extends IDetailsBaseOptions {}

@observer
class SettingReferrer extends React.Component<IProps> {
  @observable formVisible = false

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @action.bound openForm() {
    this.formVisible = true
  }

  @action.bound closeForm() {
    this.formVisible = false
  }

  render() {
    return (
      <>
        <ReferrerCard onOpenForm={this.openForm} />
        <ReferrerForm
          visible={this.formVisible}
          onClose={this.closeForm}
          bucketName={this.props.bucketName}
        />
      </>
    )
  }
}

export default SettingReferrer
