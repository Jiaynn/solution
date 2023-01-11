/**
 * @description media style drawer store
 * @author duli <duli@qiniu.com>
 */

import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'
import { action, makeObservable, observable, when } from 'mobx'

import { MediaStyle } from 'kodo/apis/bucket/image-style'
import { MediaStyleType } from '../constants'
import { FileInfo } from '../Preview/Content'

interface Options {
  isEditMode?: boolean
  initType?: MediaStyleType
  initStyle?: MediaStyle
  initFileObject?: FileInfo
}

export type CreateMediaStyleResult = {
  success: boolean
  newMediaStyleList?: MediaStyle[]
  allMediaStyleList?: MediaStyle[]
}

@injectable()
export class MediaStyleDrawerStore extends Store {
  constructor() {
    super()
    makeObservable(this)
  }

  @observable.ref visible = false
  @observable.ref isEditMode?: boolean
  @observable.ref initType?: MediaStyleType
  @observable.ref initStyle?: MediaStyle
  @observable.ref initFileObject?: FileInfo

  @observable.ref result: CreateMediaStyleResult

  @action.bound
  handleClose(success: boolean, newMediaStyleList?: MediaStyle[], allMediaStyleList?: MediaStyle[]) {
    this.result = { success, newMediaStyleList, allMediaStyleList }
    this.visible = false
  }

  @action.bound
  open(options: Options): Promise<CreateMediaStyleResult> {
    this.isEditMode = options.isEditMode
    this.initType = options.initType
    this.initStyle = options.initStyle
    this.initFileObject = options.initFileObject
    this.visible = true

    return new Promise(resolve => {
      when(() => !this.visible).then(() => {
        resolve(this.result)
      })
    })
  }
}
