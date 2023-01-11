/**
 * @file object picker store
 * @author yinxulai <yinxulai@qiniu.com>
 */

import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'
import { action, makeObservable, observable, when } from 'mobx'
import { Accept, ListItem } from 'kodo-base/lib/components/ObjectManager'
import { FileObject } from 'kodo-base/lib/components/ObjectManager/common/types'

import { KodoIamStore } from 'kodo/stores/iam'

import { UploadResult } from './Upload'

interface PickOptions {
  title: string
  bucket: string
  accepts: Accept[]
}

export function isUploadResult(v: ObjectPickerStore['picketed']): v is UploadResult {
  return !!(v && (v as UploadResult).key != null && typeof (v as UploadResult).key === 'string')
}

@injectable()
export class ObjectPickerStore extends Store {
  constructor(
    private iamStore: KodoIamStore
  ) {
    super()
    makeObservable(this)
  }

  @observable.ref title: string
  @observable.ref bucket: string
  @observable.ref visible = false
  @observable.ref accepts: Accept[] = []
  @observable.ref picketed?: FileObject<ListItem> | UploadResult

  @action.bound
  handleOk() {
    this.visible = false
  }

  @action.bound
  handleCancel() {
    this.visible = false
    this.picketed = undefined
  }

  @action.bound
  setPicketed(value?: FileObject<ListItem> | UploadResult) {
    this.picketed = value
  }

  hasPermission(bucket: string) {
    return !this.iamStore.isActionDeny({ actionName: 'List', resource: bucket })
  }

  @action.bound
  pick(options: PickOptions): Promise<FileObject<ListItem> | UploadResult | undefined> {
    this.title = options.title
    this.bucket = options.bucket
    this.accepts = options.accepts?.filter(Boolean) || []
    this.visible = true

    return new Promise(resolve => {
      when(() => !this.visible).then(() => {
        resolve(this.picketed)
        this.setPicketed()
      })
    })
  }
}
