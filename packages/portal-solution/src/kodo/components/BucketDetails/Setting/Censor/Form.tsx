/**
 * @file Bucket censor component
 * @description bucket 内容审核
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { action, computed, observable, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { FormState, FieldState } from 'formstate'

import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Loadings } from 'portal-base/common/loading'
import { Link } from 'portal-base/common/router'
import { Button, Row, Col, Spin } from 'react-icecream/lib'

import { valuesOf } from 'kodo/utils/ts'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'
import { getCensorListPath, getCensorCreatePath } from 'kodo/routes/censor'

import { statusNameMap, CensorStatus, CensorType } from 'kodo/constants/bucket/setting/censor'

import { Auth } from 'kodo/components/common/Auth'

import { IBucketCensorStatus, CensorApis } from 'kodo/apis/bucket/setting/censor'
import { injectMainBtnClickHookProps } from '../Card/sensors'

import styles from './style.m.less'

enum Loading {
  FetchStatus = 'fetchStatus'
}

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalCensor extends React.Component<IProps & DiDeps> {
  censorApis = this.props.inject(CensorApis)
  @observable.ref formState = this.createFormState()
  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @action.bound
  updateFormState(data: IBucketCensorStatus[]) {

    // 数据为空，没有开启任何审核
    if (!data || !data.length) {
      this.formState.reset()
      return
    }

    const streamRules = data.filter(rule => rule.type === CensorType.Stream).map(rule => rule.status)
    const censorStatus = streamRules.includes(CensorStatus.On) ? CensorStatus.On : CensorStatus.Off
    const streamStatus = streamRules.length ? censorStatus : undefined

    const batchStatus = data.filter(rule => rule.type === CensorType.Batch).map(rule => rule.status)
    const batchProcessing = batchStatus.filter(status => status === CensorStatus.On).length || undefined
    const batchCompleted = batchStatus.filter(status => status === CensorStatus.Off).length || undefined

    this.formState = this.createFormState({ streamStatus, batchProcessing, batchCompleted })
  }

  @autobind
  @Loadings.handle(Loading.FetchStatus)
  fetchStatus() {
    const { bucketName } = this.props
    return this.censorApis.getStatus(bucketName)
      .then(this.updateFormState)
  }

  @autobind
  createFormState(state?: {
    streamStatus?: CensorStatus,
    batchProcessing?: number,
    batchCompleted?: number
  }) {

    const data = {
      streamStatus: null,
      batchProcessing: null,
      batchCompleted: null,
      ...state
    }

    return new FormState({
      stream: new FieldState<CensorStatus>(data.streamStatus!),
      batch: new FormState({
        processing: new FieldState<number>(data.batchProcessing!),
        completed: new FieldState<number>(data.batchCompleted!)
      })
    })
  }

  @computed
  get streamTaskStateView() {
    const { stream } = this.formState.$

    const statusNameViewMap = {
      [CensorStatus.On]: (<span className={styles.success}>{statusNameMap.ON}</span>),
      [CensorStatus.Off]: (<span>{statusNameMap.OFF}</span>)
    }

    return (<div className={styles.state}>审核状态：{statusNameViewMap[stream.value] || '未设置'}</div>)
  }

  @computed
  get batchTaskStateView() {
    const { batch } = this.formState.$
    const { processing, completed } = batch.$
    const isAlreadySet = !!(processing.value || completed.value)

    return !isAlreadySet
      ? (<div className={styles.state}>审核状态：未设置</div>)
      : (
        <Row>
          <Col span={12}>
            <div className={styles.state}>
              审核中：
              <span className={styles.processingText}>{processing.value}</span>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.state}>
              已完成：
              <span className={styles.completedText}>{completed.value}</span>
            </div>
          </Col>
        </Row>
      )
  }

  render() {
    const { bucketName } = this.props

    return (
      <div>
        <Spin spinning={this.loadings.isLoading(Loading.FetchStatus)}>
          <Row>
            <Col span={12} className={styles.cloumn}>
              <div className={styles.title}>增量审核</div>
              {this.streamTaskStateView}
              <Row className={styles.button}>
                <Link to={getCensorListPath(CensorType.Stream, bucketName)}>
                  <Button {...injectMainBtnClickHookProps('内容审核')}>
                    查看增量设置
                  </Button>
                </Link>
              </Row>
              <Row className={styles.button}>
                <Link to={getCensorCreatePath(CensorType.Stream, bucketName)}>
                  <Auth
                    notProtectedUser
                    render={disabled => (
                      <Button type="dashed" icon="plus" disabled={disabled}>
                        添加增量设置
                      </Button>
                    )}
                  />
                </Link>
              </Row>
            </Col>
            <Col span={12} className={styles.cloumn}>
              <div className={styles.title}>存量审核</div>
              {this.batchTaskStateView}
              <Row className={styles.button}>
                <Link to={getCensorListPath(CensorType.Batch, bucketName)}>
                  <Button {...injectMainBtnClickHookProps('内容审核')}>
                    查看存量设置
                  </Button>
                </Link>
              </Row>
              <Row className={styles.button}>
                <Link to={getCensorCreatePath(CensorType.Batch, bucketName)}>
                  <Auth
                    notProtectedUser
                    render={disabled => (
                      <Button type="dashed" icon="plus" disabled={disabled}>
                        添加存量设置
                      </Button>
                    )}
                  />
                </Link>
              </Row>
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }

  componentDidMount() {
    this.fetchStatus()
  }
}

export default function Censor(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalCensor {...props} inject={inject} />
    )} />
  )
}
