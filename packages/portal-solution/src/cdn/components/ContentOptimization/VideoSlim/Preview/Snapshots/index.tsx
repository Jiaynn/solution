/**
 * @desc component for 视频瘦身截帧对比
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React, { ReactElement } from 'react'
import { observer } from 'mobx-react'
import { computed, observable, action, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'
import { noop } from 'lodash'

import Modal from 'react-icecream/lib/modal'

import { ModalStore } from 'cdn/stores/modal'

import Swiper from 'cdn/components/common/Swiper'
import { IPicture } from '../VideoPlayer'
import { SnapshotThumb, Snapshot, SnapshotType } from '../Snapshot'

import './style.less'

export interface ISnapshotPair {
  before: IPicture
  after: IPicture
}

export interface IProps {
  list: ISnapshotPair[]
}

@observer
export default class Snapshots extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @observable swiperIndex!: number

  @action updateSwiperIndex(index: number) {
    this.swiperIndex = index
  }

  @observable detailSwiperIndex!: number

  @action updateDetailSwiperIndex(index: number) {
    this.detailSwiperIndex = index
  }

  detailModal = new ModalStore()

  handleThumbClick(pairIndex: number) {
    this.detailModal.open().catch(noop)
    this.updateDetailSwiperIndex(pairIndex) // 大图翻到指定的对应的页
  }

  @computed get snapShotsView() {
    const items: ReactElement[] = []
    this.props.list.forEach(({ before, after }, index) => {
      items.push((
        <SnapshotThumb
          key={`before-${index}-${before.time}`}
          picture={before}
          type={SnapshotType.Before}
          onClick={() => this.handleThumbClick(index)}
        />
      ), (
        <SnapshotThumb
          key={`after-${index}-${after.time}`}
          picture={after}
          type={SnapshotType.After}
          onClick={() => this.handleThumbClick(index)}
        />
      ))
    })

    return (
      <Swiper
        className="swiper-snapshots"
        activeIndex={this.swiperIndex}
      >
        {items}
      </Swiper>
    )
  }

  @autobind
  handleDetailIndexChange(current: number) {
    this.updateDetailSwiperIndex(current) // 更新当前 swiper 状态，防止再次打开最初指定的 index 时不能正确响应到对应位置
    this.updateSwiperIndex(current * 2) // 缩略图翻到指定的对应的页
  }

  @computed get detailView() {
    const options = {
      slidesPerView: 1
    }

    const items = this.props.list.map((pair, index) => (
      <div key={`detail-${index}`}>
        <Snapshot picture={pair.before} type={SnapshotType.Before} />
        <Snapshot picture={pair.after} type={SnapshotType.After} />
      </div>
    ))

    return (
      <div className="detail-content">
        <Swiper
          className="swiper-detail"
          options={options}
          activeIndex={this.detailSwiperIndex}
          onChange={this.handleDetailIndexChange}
        >
          {items}
        </Swiper>
      </div>
    )
  }

  render() {
    return (
      <div className="comp-snapshots">
        {this.snapShotsView}
        <Modal
          width="100%"
          className="detail-swiper-modal"
          footer={null}
          {...this.detailModal.bind()}
        >
          {this.detailView}
        </Modal>
      </div>
    )
  }
}
