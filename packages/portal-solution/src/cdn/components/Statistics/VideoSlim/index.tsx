/**
 * @desc 数据统计 - 视频瘦身
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { observable, action, computed, makeObservable } from 'mobx'

import Radio from 'react-icecream/lib/radio'

import { IVideoSlimOptions } from 'cdn/apis/statistics'
import Benefit from './Benefit'
import Usage from './Usage'

import './style.less'

export interface IProps {
  options: IVideoSlimOptions
}

enum Aspect {
  /* eslint-disable */
  Benefit,
  Usage
}

@observer
export default class StatisticsVideoSlim extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @observable currentAspect: Aspect = Aspect.Benefit

  @action updateCurrentAspect(value: Aspect) {
    this.currentAspect = value
  }

  @computed get result() {
    return (
      this.currentAspect === Aspect.Benefit
      ? <Benefit options={this.props.options} />
      : <Usage options={this.props.options} />
    )
  }

  render() {
    return (
      <div className="statistics-content-wrapper">
        <div className="display-control">
          <Radio.Group
            value={this.currentAspect}
            onChange={e => this.updateCurrentAspect(e.target.value)}
          >
            <Radio.Button value={Aspect.Benefit}>效益</Radio.Button>
            <Radio.Button value={Aspect.Usage}>使用</Radio.Button>
          </Radio.Group>
        </div>
        {this.result}
      </div>
    )
  }
}
