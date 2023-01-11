/**
 * @file CrossOrigin component
 * @description 跨域设置
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { computed, observable, action, makeObservable } from 'mobx'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Table, Button, Tooltip, Popconfirm, Tag } from 'react-icecream/lib'

import { IDetailsBaseOptions, getSettingPath } from 'kodo/routes/bucket'

import BackButton from 'kodo/components/common/BackButton'
import { Auth } from 'kodo/components/common/Auth'
import HelpDocLink from 'kodo/components/common/HelpDocLink'
import Prompt from 'kodo/components/common/Prompt'

import { ICrossOriginRule, CrossOriginApis } from 'kodo/apis/bucket/setting/cross-origin'
import EditRuleDrawer from './EditRuleDrawer'

import styles from './style.m.less'

class CrossTable extends Table<ICrossOriginRule> { }
class CrossTableColumn extends Table.Column<ICrossOriginRule> { }

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalCrossOrigin extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  crossOriginApis = this.props.inject(CrossOriginApis)
  @observable.ref crossOriginRules: ICrossOriginRule[] = [] // 全部规则
  @observable isCreateRuleDrawerVisible = false // 创建规则的 visible
  @observable currentEditingIndex: number | null = null // 当前编辑的规则的索引

  componentDidMount() {
    this.fetchCrossOriginRules()
  }

  @action.bound
  updateCreateRuleVisible(visible: boolean) {
    this.isCreateRuleDrawerVisible = visible
  }

  @action.bound
  updateCurrentEditingIndex(index: number | null) {
    this.currentEditingIndex = index
  }

  // 更新本地数据
  @action.bound
  updateLocalCrossRules(data: ICrossOriginRule[]) {
    this.crossOriginRules = data || []
  }

  // 上传规则到服务器
  @autobind
  updateRemoteCorsRules(data: ICrossOriginRule[]) {
    const req = this.crossOriginApis.updateCrossOriginRules(this.props.bucketName, data)
    req.then(this.fetchCrossOriginRules).catch(() => { /**/ })
    return req
  }

  // 获取服务器上的规则
  @autobind
  fetchCrossOriginRules() {
    const req = this.crossOriginApis.getCrossOriginRules(this.props.bucketName) // 拉取
    req.then(reles => this.updateLocalCrossRules(reles)).catch(() => { /**/ }) // 更新本地数据
    return req
  }

  // 删除指定的一条规则
  @autobind
  @Toaster.handle('删除成功')
  removeCrossOriginRule(index: number) {
    const rules = this.crossOriginRules.slice() // 拷贝
    rules.splice(index, 1)
    return this.updateRemoteCorsRules(rules)
  }

  // 创建服务器上的规则
  @autobind
  @Toaster.handle('创建成功')
  createCrossOriginRule(data: ICrossOriginRule) {
    const rules = [...this.crossOriginRules, data]
    const req = this.updateRemoteCorsRules(rules)
    req.then(() => this.updateCreateRuleVisible(false)).catch(() => { /**/ })
    return req
  }

  // 修改服务器上的规则
  @autobind
  @Toaster.handle('修改成功')
  changeCrossOriginRule(index: number, data: ICrossOriginRule) {
    const rules = this.crossOriginRules.slice() // 拷贝
    rules[index] = data
    const req = this.updateRemoteCorsRules(rules)
    req.then(() => this.updateCurrentEditingIndex(null)).catch(() => { /**/ })
    return req
  }

  // 清空服务器上的规则
  @autobind
  @Toaster.handle('清空成功')
  clearCrossOriginRules() {
    return this.updateRemoteCorsRules([])
  }

  @computed
  get addRuleButtonView() {
    // 最多创建 10 条
    const isDisabled = this.crossOriginRules.length >= 10

    const buttonView = (
      <Auth
        notProtectedUser
        render={disabled => (
          <Button
            type="primary"
            icon="plus"
            disabled={disabled || isDisabled}
            onClick={() => this.updateCreateRuleVisible(true)}
          >
            新增规则
          </Button>
        )}
      />
    )

    return !isDisabled
      ? buttonView
      // TODO: Tooltip 鼠标一定要向 placement 方向浮过才消失？？
      : <Tooltip placement="top" title="每个空间最多只允许创建十条规则">{buttonView}</Tooltip>
  }

  @computed
  get clearRuleButtonView() {
    return (
      <Popconfirm
        placement="bottom"
        title="确定清空全部跨域规则？"
        onConfirm={() => this.clearCrossOriginRules()}
      >
        <Button type="default">清空全部规则</Button>
      </Popconfirm>
    )
  }

  @computed
  get createCorsRuleDrawerView() {
    return (
      <EditRuleDrawer
        title="创建跨域规则" // title
        visible={this.isCreateRuleDrawerVisible} // 显示隐藏
        onSubmit={this.createCrossOriginRule} // 点击提交
        onCancel={() => this.updateCreateRuleVisible(false)} // 点击取消
      />
    )
  }

  @computed
  get editCorsRuleDrawerView() {
    const visible = this.currentEditingIndex !== null

    const editingData = this.currentEditingIndex != null
      ? this.crossOriginRules[this.currentEditingIndex]
      : undefined

    return (
      <EditRuleDrawer
        visible={visible} // 显示隐藏
        title="编辑跨域规则" // title
        data={editingData}
        onSubmit={data => this.changeCrossOriginRule(this.currentEditingIndex!, data)} // 点击提交
        onCancel={() => this.updateCurrentEditingIndex(null)} // 点击取消
      />
    )
  }

  @autobind
  renderAction(_, __, index: number) {
    return (
      <span>
        <Auth notProtectedUser>
          <Button
            type="link"
            className={styles.operationButton}
            onClick={() => this.updateCurrentEditingIndex(index)}
          >
            编辑
          </Button>
        </Auth>
        <Popconfirm
          placement="bottom"
          title="确定删除该条规则？"
          onConfirm={() => this.removeCrossOriginRule(index)}
        >
          <Button
            type="link"
            className={styles.operationButton}
          >
            删除
          </Button>
        </Popconfirm>
      </span>
    )
  }

  @autobind
  renderItems(items: string[]) {
    return (
      <ul className={styles.listItem}>
        {items && items.map((value: string, index: number) => <li key={index}>{value}</li>)}
      </ul>
    )
  }

  @autobind
  renderMethodItems(_, record: ICrossOriginRule) {
    return (
      <ul className={styles.listItem}>
        {record.allowed_method && record.allowed_method.map((value: string, index: number) => (
          <li key={index}><Tag color="grey1" className={styles.textColor}>{value}</Tag></li>
        ))}
      </ul>
    )
  }

  render() {
    return (
      <div className={styles.content}>
        <Prompt type="assist" className={styles.pageTip}>
          <span>存储空间默认允许跨域访问；当添加了自定义跨域规则时，只有在规则匹配时，跨域请求才会被允许。</span>
          <HelpDocLink doc="crossOrigin">了解更多</HelpDocLink>
        </Prompt>
        <div className={styles.topBar}>
          <BackButton path={getSettingPath(this.props.inject, this.props)} />
          {this.addRuleButtonView}
          {this.clearRuleButtonView}
          {this.editCorsRuleDrawerView}
          {this.createCorsRuleDrawerView}
        </div>
        <div>
          <CrossTable
            pagination={false}
            dataSource={this.crossOriginRules}
            rowKey={(_, index) => String(index)}
          >
            <CrossTableColumn
              width="20%"
              title="来源"
              key="allowed_origin"
              dataIndex="allowed_origin"
              render={this.renderItems}
            />
            <CrossTableColumn
              width="10%"
              title="允许 Methods"
              key="allowed_method"
              dataIndex="allowed_method"
              render={this.renderMethodItems}
            />
            <CrossTableColumn
              width="10%"
              title="允许 Headers"
              key="allowed_header"
              dataIndex="allowed_header"
              render={this.renderItems}
            />
            <CrossTableColumn
              width="10%"
              title="暴露 Headers"
              key="exposed_header"
              dataIndex="exposed_header"
              render={this.renderItems}
            />
            <CrossTableColumn
              width="10%"
              key="max_age"
              title="缓存时间(单位 s)"
              dataIndex="max_age"
            />
            <CrossTableColumn
              width="8%"
              title="操作"
              key="operating"
              render={this.renderAction}
            />
          </CrossTable>
        </div>
      </div>
    )
  }
}

export default function CrossOrigin(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalCrossOrigin {...props} inject={inject} />
    )} />
  )
}
