/*
 * @file component Company Drawer of Complete
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observable, computed, action, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import Drawer from 'react-icecream/lib/drawer'
import Select from 'react-icecream/lib/select'
import Switch from 'react-icecream/lib/switch'
import Form from 'react-icecream/lib/form'
import Spin from 'react-icecream/lib/spin'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'

import { Link } from 'portal-base/common/router'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import SslApis, { ICompany } from '../../apis/ssl'
import CompanyForm, { IState, createState, getValue } from '../SSLOverview/Info/Company/Form'
import DrawerStore from '../../stores/drawer'

export interface ICompanyDrawerProps {
  store: CompanyDrawerStore
}

export const CompanyDrawer = observer(function _CompanyDrawer(props: ICompanyDrawerProps) {
  const { store } = props
  return (
    <Drawer
      title={store.title}
      className="company-drawer-wrapper"
      width="640px"
      closable={false}
      onClose={() => store.cancel()}
      onOk={() => store.confirm()}
      visible={store.visible}
      footerExtra={
        <>
          <span className="use-only">
            仅本次使用
            <Tooltip title="开启后该条信息将不会被保存，仅用于本次购买使用">
              <Icon className="tip-icon" type="info-circle" />
            </Tooltip>
          </span>
          <Switch checked={store.useOnly} onChange={checked => store.updateUseOnly(checked)} />
        </>
      }
    >
      <Spin spinning={store.isLoading}>
        {
          store.drawerState.isModify && (
            <>
              <Form.Item labelAlign="left"
                label={
                  <span>
                    已有公司信息
                    <Tooltip title={
                      <span>
                        可在下拉列表中选择已保存至
                        <Link to="/certificate/ssl#info" target="_blank">SSL证书服务-我的信息</Link>
                        中的公司信息。
                      </span>
                    }
                    >
                      <Icon className="tip-icon" type="info-circle" />
                    </Tooltip>
                  </span>
                }
              >
                <Select style={{ width: '100%' }}
                  value={store.extra && store.extra.id}
                  onChange={(companyId: string) => store.handleCompanySelectChange(companyId)}
                >
                  {
                    store.companyList.map(company => (
                      <Select.Option key={company.id} value={company.id}>{company.remarkName}{company.isDefault && ' (默认)'}</Select.Option>
                    ))
                  }
                </Select>
              </Form.Item>
            </>
          )
        }
        <CompanyForm state={store.formState} needRemarkName={!store.useOnly} />
      </Spin>
    </Drawer>
  )
})

enum LoadingType {
  GetCompanyList = 'GetCompanyList'
}

export interface ICompanyInfoWithUseOnly extends ICompany {
  useOnly: boolean
}

export class CompanyDrawerStore extends DrawerStore<ICompany, ICompanyInfoWithUseOnly> {
  constructor(
    toasterStore: ToasterStore,
    private sslApis: SslApis
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, toasterStore)
  }

  @observable.ref formState: IState = createState(undefined, () => !this.useOnly)
  @observable.ref companyList: ICompany[] = []
  @observable useOnly = true

  loading = Loadings.collectFrom(this, LoadingType)

  @computed get isLoading() {
    return !this.loading.isAllFinished()
  }

  @computed get title() {
    return this.drawerState.isModify ? '编辑公司信息' : '创建公司信息'
  }

  @action updateCompanyList(companyList: ICompany[]) {
    this.companyList = companyList || []
  }

  @action updateUseOnly(useOnly: boolean) {
    this.useOnly = useOnly
  }

  handleCompanySelectChange(companyId: string) {
    this.updateExtra(this.companyList.find(item => item.id === companyId)!)
  }

  @action reset() {
    this.formState = createState(undefined, () => !this.useOnly)
  }

  confirm() {
    this.formState.validate()
      .then(res => {
        if (res.hasError) {
          return
        }
        const useOnlyProps = this.useOnly
        ? { useOnly: true, id: undefined }
        : { useOnly: false, id: this.extra && this.extra.id }
        this.submit({ ...this.extra, ...getValue(this.formState), ...useOnlyProps })
      })
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetCompanyList)
  fetchCompanyList() {
    return this.sslApis.getCompanyList()
      .then(({ list }) => this.updateCompanyList(list))
  }

  init() {
    this.addDisposer(reaction(
      () => this.extra,
      company => {
        this.formState = createState(company, () => !this.useOnly)
      }
    ))

    this.addDisposer(() => this.formState.dispose())

    // 每次打开 drawer 时，拉取数据
    this.addDisposer(reaction(
      () => this.visible && this.drawerState.isModify,
      shouldFetch => {
        if (shouldFetch) {
          this.fetchCompanyList()
        }
      }
    ))
  }
}
