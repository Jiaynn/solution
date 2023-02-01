/**
 * @author: corol
 * @github: github.com/huangbinjie
 * @created: Thu May 30 2019
 * @desc: 生命周期管理
 *
 * Copyright (c) 2019 Qiniu
 */

import * as React from 'react'
import { action, computed, observable, makeObservable } from 'mobx'
import { Observer, observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc, Provider } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import Table from 'react-icecream/lib/table'
import { Button, Popconfirm, Icon } from 'react-icecream/lib'
import Role from 'portal-base/common/components/Role'
import { StorageType, storageTypeTextMap } from 'kodo-base/lib/constants'

import { humanizeTimestamp } from 'kodo/transforms/date-time'

import { KodoIamStore } from 'kodo/stores/iam'

import { IDetailsBaseOptions, getSettingPath } from 'kodo/routes/bucket'

import { RegionSymbol } from 'kodo/constants/region'
import { BucketSettingLifecycleRole } from 'kodo/constants/role'

import BackButton from 'kodo/components/common/BackButton'
import { Auth } from 'kodo/components/common/Auth'
import HelpDocLink from 'kodo/components/common/HelpDocLink'

import { LifecycleRule } from 'kodo/apis/bucket/setting/lifecycle-rules'
import { ResourceApis } from 'kodo/apis/bucket/resource'

import RuleStore, { Loading } from './rule-store'
import RuleEditor from './RuleEditor'
import RuleEditorStore, { EditType } from './RuleEditor/store'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions {
  region: RegionSymbol
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalLifecycle extends React.Component<IProps & DiDeps> {
  ruleStore = this.props.inject(RuleStore)
  resourceApis = this.props.inject(ResourceApis)
  ruleEditorStore = this.props.inject(RuleEditorStore)
  iamStore = this.props.inject(KodoIamStore)

  @observable isPiliUsedBucket = false

  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @computed
  get isGetDenied() {
    return this.iamStore.isActionDeny({ actionName: 'GetBucketLifecycle', resource: this.props.bucketName })
  }

  @autobind
  handleDeleteItem(ruleName: string) {
    this.ruleStore.deleteRule(ruleName).then(() => {
      if (!this.isGetDenied) {
        this.ruleStore.getRules()
      }
    })
  }

  @action.bound
  updateIsPiliUsedBucket(used: boolean) {
    this.isPiliUsedBucket = used
  }

  fetchIsPillUsedInfo() {
    return this.resourceApis.isPiliUsed(this.props.bucketName).then(this.updateIsPiliUsedBucket)
  }

  renderTableOperationColumn = (record: LifecycleRule) => (<>
    {this.props.region && (
      <Auth
        notProtectedUser
        iamPermission={{ actionName: 'PutBucketLifecycle', resource: this.props.bucketName }}
      >
        <Role name={BucketSettingLifecycleRole.EditRuleEntry}>
          <Button type="link" onClick={() => this.ruleEditorStore.open(this.props.region, record)}>
            编辑
          </Button>
        </Role>
      </Auth>
    )}
    <Auth
      iamPermission={{ actionName: 'DeleteBucketLifecycle', resource: this.props.bucketName }}
    >
      <Role name={BucketSettingLifecycleRole.DeleteRuleEntry}>
        <Popconfirm
          placement="bottom"
          title="确定要删除这条规则吗？"
          onConfirm={() => this.handleDeleteItem(record.name)}
        >
          <Button type="link">删除</Button>
        </Popconfirm>
      </Role>
    </Auth>
  </>)

  renderActionColumn = (rule: LifecycleRule) => {
    const actionChildren: React.ReactNode[] = []
    const current = rule.transition || []
    const noncurrent = rule.noncurrent_version_transition || []

    current.forEach(trans => {
      if (trans.days > 0) {
        actionChildren.push(
          <div
            key={StorageType[trans.storage_class]}
            className={styles.action}
          >
            转{storageTypeTextMap[trans.storage_class]}(当前版本)：{trans.days} 天
          </div>
        )
      }
    })

    if (rule.expiration.days > 0) {
      actionChildren.push(
        <div
          key="delete_after_days"
          className={styles.action}
        >
          删除文件(当前版本): {rule.expiration.days} 天
        </div>
      )
    }

    noncurrent.forEach(trans => {
      if (trans.noncurrent_days > 0) {
        actionChildren.push(
          <div
            key={'noncurrent_' + StorageType[trans.storage_class]}
            className={styles.action}
          >
            转{storageTypeTextMap[trans.storage_class]}(历史版本)：{trans.noncurrent_days} 天
          </div>
        )
      }
    })

    if (rule.noncurrent_version_expiration.noncurrent_days > 0) {
      actionChildren.push(
        <div
          key="history_delete_after_days"
          className={styles.action}
        >
          删除文件(历史版本): {rule.noncurrent_version_expiration.noncurrent_days} 天
        </div>
      )
    }

    if (actionChildren.length === 0) {
      actionChildren.push('无')
    }

    return actionChildren
  }

  @computed
  get promptView() {
    if (!this.isPiliUsedBucket) {
      return null
    }
    return <div className={styles.prompt}>直播落存储的文件，在直播空间里设置的存储过期时间优先级高于此处设置的生命周期规则。</div>
  }

  @computed
  get ruleTableView() {
    const isLoading = this.ruleStore.isLoading()
    return (
      <Table
        rowKey="name"
        loading={isLoading}
        pagination={false}
        dataSource={this.ruleStore.rules.slice()}
      >
        <Table.Column
          width="20%"
          key="name"
          title="规则名称"
          dataIndex="name"
        />
        <Table.Column<LifecycleRule>
          width="20%"
          title="规则策略"
          key="prefix"
          render={(_, { prefix }) => (prefix ? <span className={styles.space}>{`对前缀生效：${prefix}`}</span> : '对整个空间生效')}
        />
        <Table.Column<LifecycleRule>
          key="delete_after_days"
          title="动作"
          render={(_, rule) => this.renderActionColumn(rule)}
        />
        <Table.Column<LifecycleRule>
          key="ctime"
          title="创建时间"
          dataIndex="ctime"
          render={ctime => humanizeTimestamp(new Date(ctime).getTime())}
        />
        <Table.Column
          key="ope"
          title="操作"
          render={(_, record: LifecycleRule) => (
            <Observer render={() => this.renderTableOperationColumn(record)} />
          )}
        />
      </Table>
    )
  }

  handleOk = (rule: LifecycleRule, type: EditType) => {
    const get = () => {
      if (!this.isGetDenied) {
        this.ruleStore.getRules()
      }
    }
    return type === EditType.Update
            ? this.ruleStore.updateRule(rule).then(get)
            : this.ruleStore.addRule(rule).then(get)
  }

  componentDidMount() {
    if (this.iamStore.isIamUser) {
      this.iamStore.fetchIamActionsByResource(this.props.bucketName, true).then(() => {
        if (!this.isGetDenied) this.ruleStore.getRules()
      })
    } else {
      this.ruleStore.getRules()
    }

    this.ruleStore.fetchBucketInfo()

    this.fetchIsPillUsedInfo()
  }

  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div>
            <BackButton path={getSettingPath(this.props.inject, this.props)} />
            <Auth
              notProtectedUser
              iamPermission={[
                { actionName: 'PutBucketLifecycle', resource: this.props.bucketName },
                { actionName: 'GetBucketLifecycle', resource: this.props.bucketName }
              ]}
              render={disabled => (this.props.region
                ? <Observer render={() => (
                  <Role name={BucketSettingLifecycleRole.CreateRuleEntry}>
                    <Button
                      type="primary"
                      icon="plus"
                      disabled={disabled}
                      onClick={() => this.ruleEditorStore.open(this.props.region)}
                    >
                      新增规则
                    </Button>
                  </Role>
                )} />
                : <></>)}
            />
          </div>
          <div>
            <HelpDocLink doc="lifecycle" className={styles.detailLink}>
              <Icon type="file-text" /> 了解生命周期生效时间
            </HelpDocLink>
          </div>
        </div>
        {this.promptView}
        <section className={styles.tableWrapper}>
          {this.ruleTableView}
        </section>
        <RuleEditor
          store={this.ruleEditorStore}
          confirmLoading={this.ruleStore.isLoading(Loading.AddRule) || this.ruleStore.isLoading(Loading.UpdateRule)}
          bucketName={this.props.bucketName}
          onOk={this.handleOk}
        />
      </div>
    )
  }
}

export default function Lifecycle(props: IProps) {
  const ruleStore = useLocalStore(RuleStore, { bucketName: props.bucketName })
  const ruleEditorStore = useLocalStore(RuleEditorStore, { getBucketRules: () => ruleStore.rules })

  const provides = React.useMemo(() => ([
    { identifier: RuleStore, value: ruleStore },
    { identifier: RuleEditorStore, value: ruleEditorStore }
  ]), [ruleEditorStore, ruleStore])

  return (
    <Provider provides={provides}>
      <Inject render={({ inject }) => (
        <InternalLifecycle {...props} inject={inject} />
      )} />
    </Provider>
  )
}
