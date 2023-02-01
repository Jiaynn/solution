/**
 * @file Bucket setting event page component
 * @description Bucket setting event page
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { observer } from 'mobx-react'
import { computed, observable, action, makeObservable } from 'mobx'
import classNames from 'classnames'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Button, Table, Tag, Popconfirm, Icon } from 'react-icecream/lib'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import Role from 'portal-base/common/components/Role'

import { valuesOf } from 'kodo/utils/ts'

import { ConfigStore } from 'kodo/stores/config'

import { KodoIamStore } from 'kodo/stores/iam'

import { IDetailsBaseOptions, getSettingPath } from 'kodo/routes/bucket'

import { RegionSymbol } from 'kodo/constants/region'
import { BucketSettingEventRole } from 'kodo/constants/role'

import BackButton from 'kodo/components/common/BackButton'
import { Auth } from 'kodo/components/common/Auth'
import Prompt from 'kodo/components/common/Prompt'

import RuleForm from './Form'
import { EventNotificationRuleApi, EventNotificationRule } from 'kodo/apis/bucket/setting/event-notification-rules'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions {
  region: RegionSymbol
}

interface DiDeps {
  inject: InjectFunc
}

enum Loading {
  GetRules = 'GetRules',
  CreateRule = 'CreateRule',
  UpdateRule = 'UpdateRule',
  DeleteRule = 'DeleteRule'
}

@observer
class InternalSettingEvent extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  // eventApis = this.props.inject(EventApis)
  eventNotificationApis = this.props.inject(EventNotificationRuleApi)
  configStore = this.props.inject(ConfigStore)
  featureStore = this.props.inject(FeatureConfigStore)
  iamStore = this.props.inject(KodoIamStore)

  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  @observable.ref rules: EventNotificationRule[] = []
  @observable formBaseDataIndex: number | null = null
  @observable formVisible = false
  @observable isArrowActive = false

  @computed
  get isGetDenied() {
    return this.iamStore.isActionDeny({ actionName: 'GetBucketNotification', resource: this.props.bucketName })
  }
  @computed
  get regionConfig() {
    return this.configStore.getRegion({ region: this.props.region })
  }

  @computed get formBaseData() {
    if (this.formBaseDataIndex != null) {
      return this.rules[this.formBaseDataIndex]
    }
  }

  @computed get isGettingRules() {
    return this.loadings.isLoading(Loading.GetRules)
  }

  @computed get isSavingRules() {
    return [Loading.CreateRule, Loading.UpdateRule].some(event => this.loadings.isLoading(event))
  }

  @computed get isDeletingRules() {
    return this.loadings.isLoading(Loading.DeleteRule)
  }

  @action.bound updateRules(rules: EventNotificationRule[]) {
    this.rules = rules || []
  }

  @action.bound updateFormVisible(visible: boolean) {
    this.formVisible = visible
  }

  @action.bound updateFormBaseDataIndex(index: number | null) {
    this.formBaseDataIndex = index
  }

  @action.bound handleAddRule() {
    this.updateFormBaseDataIndex(null)
    this.updateFormVisible(true)
  }

  @action.bound handleEditRule(index: number) {
    this.updateFormBaseDataIndex(index)
    this.updateFormVisible(true)
  }

  @action.bound handleCancelForm() {
    this.updateFormVisible(false)
    this.updateFormBaseDataIndex(null)
  }

  @action.bound handleSubmitted() {
    this.handleCancelForm()
    if (!this.isGetDenied) {
      this.fetchRules()
    }
  }

  @action.bound
  toggleArrowActive() {
    this.isArrowActive = !this.isArrowActive
  }

  @autobind handleDeleteRule(rule: EventNotificationRule) {
    this.deleteRule(rule)
      .then(() => {
        if (!this.isGetDenied) {
          this.fetchRules()
        }
      })
  }

  @autobind handleFormSubmit(ruleOptions: EventNotificationRule) {
    if (this.formBaseData) {
      this.updateRule(ruleOptions).then(this.handleSubmitted)
    } else {
      this.addRule(ruleOptions).then(this.handleSubmitted)
    }
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(Loading.GetRules)
  fetchRules() {
    return this.eventNotificationApis.fetchRules(this.props.bucketName).then(rules => {
      this.updateRules(rules.notifications)
    })
  }

  @autobind
  @Toaster.handle('创建成功')
  @Loadings.handle(Loading.CreateRule)
  addRule(ruleOptions: EventNotificationRule) {
    return this.eventNotificationApis.putRule(this.props.bucketName, [...this.rules, ruleOptions])
  }

  @autobind
  @Toaster.handle('更新操作成功')
  @Loadings.handle(Loading.UpdateRule)
  updateRule(ruleOptions: EventNotificationRule) {
    const otherRules = this.rules.filter(rule => !(rule.name === ruleOptions.name))
    return this.eventNotificationApis.putRule(this.props.bucketName, [...otherRules, ruleOptions])
  }

  @autobind
  @Toaster.handle('删除操作成功')
  @Loadings.handle(Loading.DeleteRule)
  deleteRule(rule: EventNotificationRule) {
    return this.eventNotificationApis.deleteRule(this.props.bucketName, rule.name)
  }

  @autobind renderAffix(_, record: EventNotificationRule) {
    const { prefix, suffix } = record
    const prefixText = '前缀：' + prefix
    const suffixText = '后缀：' + suffix
    const bucketText = '整个空间'
    if (prefix) {
      return <span className={styles.space}>{prefixText}</span>
    }

    if (suffix) {
      return <span className={styles.space}>{suffixText}</span>
    }

    return bucketText
  }

  @autobind renderNotificationEvents(_, rule: EventNotificationRule) {
    return rule.events.map(event => (
      <Tag className={styles.textColor} key={event} color="grey1">{event}</Tag>
    ))
  }

  @autobind renderCallbackUrls(_, rule: EventNotificationRule) {
    return rule.callback_urls.map(url => (
      <Tag className={styles.textColor} key={url} color="grey1">{url}</Tag>
    ))
  }

  render() {
    const s3ApiEnable = (
      this.regionConfig.objectStorage.domain.awsS3.enable
      && !this.featureStore.isDisabled('KODO.KODO_S3API')
    )

    return (
      <div className={styles.wrapper}>
        {s3ApiEnable && (
          <Prompt type="assist" className={styles.pageTip} onClick={this.toggleArrowActive}>
            <div>
              <Icon className={classNames(styles.arrow, this.isArrowActive && styles.arrowActive)} type="right" />
              事件通知规则，也对 AWS S3 兼容 api 生效，点击查看事件与 api 对应关系。
            </div>
            <div className={classNames(styles.matchEvents, this.isArrowActive && styles.display)}>
              put 事件：PutObject、PostObject<br />
              copy 事件：CopyObject<br />
              delete 事件：DeleteObject、DeleteObjects<br />
              mkfile 事件：CompleteMultipartUpload
            </div>
          </Prompt>
        )}
        <div className={styles.toolbar}>
          <BackButton
            path={getSettingPath(this.props.inject, this.props)}
          />
          <Auth
            notProtectedUser
            iamPermission={[
              { actionName: 'PutBucketNotification', resource: this.props.bucketName },
              { actionName: 'GetBucketNotification', resource: this.props.bucketName }
            ]}
            render={disabled => (
              <Role name={BucketSettingEventRole.CreateRuleEntry}>
                <Button
                  type="primary"
                  icon="plus"
                  onClick={this.handleAddRule}
                  disabled={disabled}
                >
                  创建事件规则
                </Button>
              </Role>
            )}
          />
        </div>
        <Role name={BucketSettingEventRole.EventList}>
          <div className={styles.content}>
            <Table
              rowKey="name"
              indentSize={60}
              pagination={false}
              className={styles.table}
              dataSource={this.rules}
              loading={this.isGettingRules}
              locale={{ emptyText: '暂无数据，你可以点击左上方的「 创建事件规则 」按钮添加数据' }}
            >
              <Table.Column key="name" dataIndex="name" title="规则名称" width={100} />
              <Table.Column
                title="规则策略"
                key="prefix"
                width={200}
                render={this.renderAffix}
              />
              <Table.Column
                title="策略"
                key="events"
                render={this.renderNotificationEvents}
              />
              <Table.Column
                title="回调地址"
                key="callback_urls"
                render={this.renderCallbackUrls}
              />
              <Table.Column
                title="操作"
                key="action"
                width={100}
                render={(_, record: EventNotificationRule, index) => (
                  <div className={styles.tableActionButtons}>
                    <Auth notProtectedUser iamPermission={{ actionName: 'PutBucketNotification', resource: this.props.bucketName }}>
                      <Role name={BucketSettingEventRole.ListItemEditEntry}>
                        <Button
                          type="link"
                          onClick={() => this.handleEditRule(index)}
                        >
                          编辑
                        </Button>
                      </Role>
                    </Auth>
                    <Auth
                      iamPermission={{ actionName: 'DeleteBucketNotification', resource: this.props.bucketName }}
                    >
                      <Role name={BucketSettingEventRole.ListItemDeleteEntry}>
                        <Popconfirm
                          placement="bottom"
                          title="确定要删除这条规则吗？"
                          onConfirm={() => this.handleDeleteRule(record)}
                        >
                          <Button type="link">删除</Button>
                        </Popconfirm>
                      </Role>
                    </Auth>
                  </div>
                )}
              />
            </Table>
          </div>
        </Role>
        <RuleForm
          region={this.props.region}
          title={`${this.formBaseData ? '编辑' : '创建'}事件通知规则`}
          visible={this.formVisible}
          existingData={this.rules}
          baseData={this.formBaseData!}
          isSubmitting={this.isSavingRules}
          onCancel={this.handleCancelForm}
          onSubmit={this.handleFormSubmit}
        />
      </div>
    )
  }

  componentDidMount() {
    if (this.iamStore.isIamUser) {
      this.iamStore.fetchIamActionsByResource(this.props.bucketName, true).then(() => {
        if (!this.isGetDenied) this.fetchRules()
      })
    } else {
      this.fetchRules()
    }
  }
}

export default function SettingEvent(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSettingEvent {...props} inject={inject} />
    )} />
  )
}
