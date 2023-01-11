/**
 * @desc utils for 添加视频瘦身任务表单
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import { FieldState, FormState } from 'formstate-x'

import { trimAndFilter } from 'cdn/transforms'

import { textPattern } from 'cdn/transforms/form'

import { httpUrl } from 'cdn/constants/pattern'

import { ICreateVideoSlimTasksReq } from 'cdn/apis/video-slim'

export enum AddFileMode {
  Hotest,
  Specific
}

export interface IValue {
  addFileMode: AddFileMode // 添加瘦身文件的方式
  hotestURLs: string[]
  specificURLs: string[]
  cdnAutoEnable: boolean // 是否开启 CDN 分发自动启用
}

export type IState = FormState<{
  addFileMode: FieldState<AddFileMode>
  hotestURLs: FieldState<string[]>
  specificURLs: FieldState<string>
  cdnAutoEnable: FieldState<boolean>
}>

export interface IProps {
  state: IState
}

export function createState(value?: Partial<IValue>): IState {
  return new FormState({
    addFileMode: new FieldState(value?.addFileMode ?? AddFileMode.Hotest),
    hotestURLs: new FieldState(value?.hotestURLs ?? []),
    specificURLs: new FieldState((value?.specificURLs ?? []).join('\n')),
    cdnAutoEnable: new FieldState(value?.cdnAutoEnable ?? false)
  }).validators(it => {
    if (it.addFileMode === AddFileMode.Hotest) {
      return (value?.hotestURLs ?? []).length > 0 ? null : '请选择视频文件'
    }
    if (it.addFileMode === AddFileMode.Specific) {
      const urls = trimAndFilter(it.specificURLs.split('\n'))
      if (urls.length === 0) {
        return '不可为空'
      }
      if (urls.find(url => !!textPattern(httpUrl)(url))) {
        return '请填写正确的 URL'
      }
    }
  })
}

export function getValue(state: IState): IValue {
  const value = state.value
  return {
    ...value,
    hotestURLs: value.hotestURLs.slice(0, value.hotestURLs.length),
    specificURLs: trimAndFilter(value.specificURLs.split('\n'))
  }
}

export function transformValueForSubmit(domain: string, value: IValue): ICreateVideoSlimTasksReq {
  return {
    urls: (
      value.addFileMode === AddFileMode.Hotest
      ? value.hotestURLs
      : value.specificURLs
    ),
    cdnAutoEnable: value.cdnAutoEnable,
    domain
  }
}
