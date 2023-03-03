/**
 * @file create bucket component
 * @description bucket 创建空间的侧滑弹窗
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { observable, computed, reaction, makeObservable, action } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { FormState, FieldState } from 'formstate'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { makeCancelled } from 'qn-fe-core/exception'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
// TODO: treeshaking 优化
import { Button, Drawer, Form, Input, Radio, Spin } from 'react-icecream/lib'

import Modal from 'react-icecream/lib/modal'

import { valuesOfEnum } from 'kodo/utils/ts'
import {
  bindFormItem,
  getValuesFromFormState,
  bindField,
  bindTextInputField
} from 'kodo/utils/formstate'

import { validateBucketNameWithLabel } from 'kodo/transforms/bucket'

import { KodoIamStore } from 'kodo/stores/iam'

import { RegionApplyStore } from 'kodo/stores/region-apply'
import { BucketStore } from 'kodo/stores/bucket'
import { ConfigStore } from 'kodo/stores/config'

import {
  PrivateType,
  privateNameMap
} from 'kodo/constants/bucket/setting/access'
import { PublicRegionSymbol, RegionSymbol } from 'kodo/constants/region'
import { bucketNameRule } from 'kodo/constants/bucket'

import Prompt from 'kodo/components/common/Prompt'

import FormTrigger from 'kodo/components/common/FormTrigger'

import { Description } from 'kodo/components/common/Description'

import { ICreateBucketOptions, BucketApis } from 'kodo/apis/bucket'

import styles from './style.m.less'
// import { MockApi } from 'apis/mock'
import { ImageSolutionApis } from 'apis/image'

export interface IData extends Partial<ICreateBucketOptions> { }

export interface IProps {
  visible: boolean; // 显示
  onClose: (newBucketName?: string, newBucketRegion?: string) => void;

  data?: IData;
}

interface DiDeps {
  inject: InjectFunc;
}

enum Loading {
  Create = 'create',
  GetApplyPassedRegions = 'getApplyPassedRegions',
}

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 19 }
} as const

function RegionNameWithTag(props: { name: string; tag?: string }) {
  return (
    <div className={styles.regionName}>
      <span className={styles.name}>{props.name}</span>
      {props.tag && <div className={styles.tag}>{props.tag}</div>}
    </div>
  )
}

@observer
class InternalCreateBucketDrawer extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  iamStore = this.props.inject(KodoIamStore);
  bucketApis = this.props.inject(BucketApis);
  userInfoStore = this.props.inject(UserInfo);
  configStore = this.props.inject(ConfigStore);
  bucketStore = this.props.inject(BucketStore);
  regionApplyStore = this.props.inject(RegionApplyStore);
  solutionAPi = this.props.inject(ImageSolutionApis);
  disposable = new Disposable();
  @observable.ref form = this.createFormState(this.props.data);
  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading));

  @computed
  get globalConfig() {
    return this.configStore.getFull()
  }

  namePromptView = (
    <Prompt>
      存储空间名称不允许重复，遇到冲突请更换名称。
      <br />
      名称格式为{bucketNameRule}。
    </Prompt>
  );

  privatePromptView = (
    <Prompt>
      公开和私有仅对 Bucket 的读文件生效，修改、删除、写入等对 Bucket
      的操作均需要拥有者的授权才能进行操作。
    </Prompt>
  );

  versionEnabledPromptView = (
    <Prompt>
      开启版本管理会自动为文件开启版本控制、同名文件的每次上传都会为之创建一个新的版本，而不是覆盖，默认访问最新版本。
    </Prompt>
  );

  @computed
  get descriptionView() {
    if (!this.globalConfig.objectStorage.createBucket.description) {
      return null
    }

    return (
      <Prompt type="assist">
        <Description
          dangerouslyText={
            this.globalConfig.objectStorage.createBucket.description
          }
        />
      </Prompt>
    )
  }

  @computed
  get isCreatePrivateTypeDisabled() {
    // 海外用户检查是否是标准海外用户（完善信息通过的称之为标准海外用户）
    if (this.userInfoStore.isOverseasUser) {
      return !this.userInfoStore.isOverseasStdUser
    }

    // 体验用户、未认证用户 不允许创建私有空间
    return this.userInfoStore.isExpUser || !this.userInfoStore.isCertified
  }

  @computed
  get isRegionApplyDisabled() {
    const region = this.form.$.region.value
    if (region == null) {
      return true
    }

    return this.regionApplyStore.isApplyDisabled(region)
  }

  @computed
  get isApplyRegionApproved() {
    const region = this.form.$.region.value
    if (region == null) {
      return false
    }

    return this.regionApplyStore.isApproved(region)
  }

  @computed
  get isCreateDisabled() {
    return (
      this.loadings.isLoading(Loading.Create) || !this.isApplyRegionApproved
    )
  }

  @computed
  get regionPromptView() {
    const region = this.form.$.region.value

    if (region == null) {
      return <Prompt>请选择一个区域</Prompt>
    }

    const regionConfig = this.configStore.getRegion({ region })

    // 不需要申请或者申请已经通过
    if (this.isApplyRegionApproved) {
      return (
        <Prompt>
          {regionConfig && regionConfig.description
            ? (
              <Description dangerouslyText={regionConfig.description} />
            )
            : (
              `此空间将会在 ${(regionConfig && regionConfig.name) || region
              } 创建。`
            )}
        </Prompt>
      )
    }

    // 禁止申请该区域
    if (this.isRegionApplyDisabled) {
      return <Prompt type="warning">该区域需要申请，当前无法创建。</Prompt>
    }

    return (
      <Spin spinning={this.loadings.isLoading(Loading.GetApplyPassedRegions)}>
        <Prompt>
          {regionConfig.apply?.description && (
            <Description dangerouslyText={regionConfig.apply?.description} />
          )}
          <Button
            size="small"
            type="link"
            onClick={() => this.regionApplyStore.open(region)}
          >
            立即申请使用。
          </Button>
        </Prompt>
      </Spin>
    )
  }

  @action.bound
  updateFormRegion(region: string | undefined | null) {
    // 跟随 url，没有参数传入则改为默认值
    if (region) this.form.$.region.onChange(region)
    else this.form.$.region.onChange(PublicRegionSymbol.Z2)
  }

  @action.bound
  updateFormPrivateType(privateType: PrivateType | undefined | null) {
    // 跟随 url，没有参数传入则改为默认值
    if (privateType) this.form.$.privateType.onChange(privateType)
    else this.form.$.privateType.onChange(PrivateType.Private)
  }

  @autobind
  async isBucketExistValidator(value: string) {
    if (await this.bucketApis.hasBucket(value)) {
      return '该空间名称已被占用'
    }
  }

  @autobind
  @Toaster.handle('创建成功')
  @Loadings.handle(Loading.Create)
  async handleCreate() {
    const searchName = this.form.$.name.value
    const region = this.form.$.region.value
    const result = await this.form.validate()

    if (result.hasError) {
      throw makeCancelled()
    }
    // 先请求kodo的创建空间
    await this.bucketStore.create(getValuesFromFormState(this.form))
    // 请求我们自己的创建bucket
    try {
      await this.solutionAPi.createBucket({
        region,
        bucket_id: searchName,
        solution_code: 'image'
      })
    } catch (error) {
      Modal.error({ content: `${error}` })
    }

    this.props.onClose(searchName, region) // 关闭
    // 根据作为 props 的 url 重新创建表单
    this.form = this.createFormState(this.props.data)
  }

  @autobind
  handleClose() {
    // 关闭表单后重新根据 url 参数创建
    this.form = this.createFormState(this.props.data)
    this.props.onClose()
  }

  @autobind
  createFormState(data: IData = {}) {
    let { privateType } = data
    const { name, region } = data
    const allRegionConfigs = this.configStore.getRegion({ allRegion: true })

    const defaultRegion = allRegionConfigs.find(
      item => item.symbol === PublicRegionSymbol.Z2
    )
      ? PublicRegionSymbol.Z2
      : allRegionConfigs[0].symbol

    // 体验用户或者未认证用户禁止创建私有类型的空间
    if (this.isCreatePrivateTypeDisabled) {
      privateType = PrivateType.Public
    }

    return new FormState({
      name: new FieldState<string>(name || '').validators(
        validateBucketNameWithLabel,
        this.isBucketExistValidator
      ),
      region: new FieldState<RegionSymbol>(region || defaultRegion),
      privateType: new FieldState<PrivateType>(
        privateType == null ? PrivateType.Private : privateType
      )
    })
  }

  render() {
    const { name, region, privateType } = this.form.$
    const allRegionConfigs = this.configStore.getRegion({ allRegion: true })

    return (
      <Drawer
        width={620}
        title="新建存储空间"
        visible={this.props.visible}
        onClose={this.handleClose}
        onOk={this.handleCreate}
        confirmLoading={this.loadings.isLoading(Loading.Create)}
        closeButtonProps={{ disabled: this.loadings.isLoading(Loading.Create) }}
        okButtonProps={{ disabled: this.isCreateDisabled }}
      >
        {this.descriptionView}
        <Form
          layout="horizontal"
          className={styles.form}
          onSubmit={e => {
            e.preventDefault()
            if (!this.isCreateDisabled) {
              this.handleCreate()
            }
          }}
        >
          <FormTrigger />
          <Form.Item
            label="存储空间名称"
            {...formItemLayout}
            {...bindFormItem(name)}
            extra={this.namePromptView}
          >
            <Input
              type="text"
              placeholder="请输入存储空间名称"
              {...bindTextInputField(name)}
              disabled={!this.isApplyRegionApproved}
            />
          </Form.Item>
          <Form.Item
            label="存储区域"
            {...formItemLayout}
            extra={this.regionPromptView}
          >
            <Radio.Group
              // TODO: radio 和 radio group 的 bindField 封装
              {...bindField(region, (e: any) => e.target.value)}
            >
              {allRegionConfigs
                .filter(i => !i.invisible)
                .map(item => {
                  const regionInfo = this.configStore.getRegion({
                    region: item.symbol
                  })
                  return (
                    <Radio key={item.symbol} value={item.symbol}>
                      <RegionNameWithTag
                        name={regionInfo.name}
                        tag={regionInfo.tag}
                      />
                    </Radio>
                  )
                })}
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="访问控制"
            {...formItemLayout}
            extra={this.privatePromptView}
          >
            <Radio.Group
              disabled={!this.isApplyRegionApproved}
              {...bindField(privateType, (e: any) => e.target.value)}
            >
              <Radio key={PrivateType.Public} value={PrivateType.Public}>
                {privateNameMap[PrivateType.Public]}
              </Radio>
              <Radio
                key={PrivateType.Private}
                value={PrivateType.Private}
                disabled={this.isCreatePrivateTypeDisabled}
              >
                {privateNameMap[PrivateType.Private]}
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Drawer>
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => {
          if (this.iamStore.isActionDeny({ actionName: 'Mkbucket' })) { return false }
          const allRegions = this.configStore.getRegion({ allRegion: true })
          return allRegions.some(region => region && region.apply?.enable)
        },
        allow => {
          if (allow) {
            this.regionApplyStore.fetchApplyRecordList()
          }
        },
        { fireImmediately: true }
      )
    )

    this.disposable.addDisposer(
      reaction(
        () => this.props.data?.region,
        region => {
          this.updateFormRegion(region)
        }
      )
    )

    this.disposable.addDisposer(
      reaction(
        () => this.props.data?.privateType,
        privateType => {
          this.updateFormPrivateType(privateType)
        }
      )
    )
  }
}

export default function CreateBucketDrawer(props: IProps) {
  return (
    <Inject
      render={({ inject }) => (
        <InternalCreateBucketDrawer {...props} inject={inject} />
      )}
    />
  )
}
