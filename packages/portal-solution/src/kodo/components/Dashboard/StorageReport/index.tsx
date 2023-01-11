/**
 * @file component StorageReport of Dashboard
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { computed, action, observable, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Button, Radio } from 'react-icecream/lib'
import { RadioChangeEvent } from 'react-icecream/lib/radio'
import Disposable from 'qn-fe-core/disposable'
import { Inject } from 'qn-fe-core/di'

import { getFormattedDateRangeValue } from 'kodo/transforms/date-time'
import { hasPreDelQueryOption } from 'kodo/transforms/statistics'

import { RegionSymbolWithAll } from 'kodo/constants/region'
import { Granularity } from 'kodo/constants/date-time'
import { StorageSrcType, StorageType } from 'kodo/constants/statistics'
import { ISeries } from 'kodo/constants/chart'

import { IStatdBaseOptions } from 'kodo/apis/statistics'

import GranularityTab from '../GranularityTab'
import { IChildComponentProps as IProps } from '../index'
import Storage from './Storage'
import FileUploadCount from './FileUploadCount'
import PreDelChart from './PreDelChart'
import styles from '../style.m.less'

export interface IStatdBaseOptionsWithRegionAll extends IStatdBaseOptions {
  region?: RegionSymbolWithAll
}

export interface IComponentProps {
  options: IStatdBaseOptionsWithRegionAll
  ftype: StorageType
  bucket: string
}

class StorageReport extends React.Component<IProps> {
  @observable currentFileUploadCount: number | null = null
  @observable averageFileUploadCount: number | null = null
  @observable granularity = Granularity.OneDay
  @observable dataType: StorageSrcType = StorageSrcType.FileStorage
  @observable.ref storageData: ISeries[]
  @observable.ref fileUploadCount: ISeries[]
  disposable = new Disposable()
  instance: React.RefObject<any> = React.createRef()

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @autobind
  exportCSV() {
    this.instance.current.downloadCSV()
  }

  @computed
  get hasPreDelQueryOption() {
    return hasPreDelQueryOption(this.props.queryOptions.ftype)
  }

  @computed
  get baseOptions() {
    const { region, bucket, dateRange } = this.props.queryOptions
    const [dateStart, dateEnd] = getFormattedDateRangeValue(dateRange)
    return {
      region,
      bucket,
      begin: dateStart,
      end: dateEnd,
      g: this.granularity
    }
  }

  @action.bound
  handleDataTypeChange(value: StorageSrcType) {
    this.dataType = value
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => this.props.queryOptions.ftype,
        ftype => {
          if (ftype === StorageType.Standard) {
            this.handleDataTypeChange(StorageSrcType.FileStorage)
          }
        }
      )
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    const { ftype, bucket } = this.props.queryOptions
    return (
      <div>
        <div className={styles.contentHeaderBox}>
          <div>
            <Radio.Group
              buttonStyle="solid"
              onChange={(e: RadioChangeEvent) => this.handleDataTypeChange(e.target.value)}
              value={this.dataType}
            >
              <Radio.Button value={StorageSrcType.FileStorage}>存储量</Radio.Button>
              {this.hasPreDelQueryOption && <Radio.Button value={StorageSrcType.FilePreDelete}>提前删除量</Radio.Button>}
              <Radio.Button value={StorageSrcType.FileUploadCount}>上传文件数</Radio.Button>
            </Radio.Group>
            <GranularityTab
              value={this.granularity}
              className={styles.tabLeftGap}
              granularities={[Granularity.OneDay]}
            />
          </div>
          <div>
            <Button icon="cloud-download" onClick={this.exportCSV}>导出 CSV</Button>
          </div>
        </div>
        {
          this.dataType === StorageSrcType.FileStorage && (
            <Inject render={({ inject }) => (
              <Storage
                inject={inject}
                ref={this.instance}
                options={this.baseOptions}
                ftype={ftype}
                bucket={bucket}
              />
            )} />
          )
        }
        {
          this.dataType === StorageSrcType.FilePreDelete && (
            <Inject render={({ inject }) => (
              <PreDelChart
                inject={inject}
                ref={this.instance}
                options={this.baseOptions}
                ftype={ftype}
                bucket={bucket}
              />
            )} />
          )
        }
        {
          this.dataType === StorageSrcType.FileUploadCount && (
            <Inject render={({ inject }) => (
              <FileUploadCount
                inject={inject}
                ref={this.instance}
                options={this.baseOptions}
                ftype={ftype}
                bucket={bucket}
              />
            )} />
          )
        }
      </div>
    )
  }
}

export default observer(StorageReport)
