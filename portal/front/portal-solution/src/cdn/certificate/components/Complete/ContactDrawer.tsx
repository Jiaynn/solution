/*
 * @file component Contact Drawer of Complete
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

import SslApis, { IContact } from '../../apis/ssl'
import ContactForm, { IState, createState, getValue } from '../SSLOverview/Info/Contact/Form'
import DrawerStore from '../../stores/drawer'

export interface IContactDrawerProps {
  store: ContactDrawerStore
}

export const ContactDrawer = observer(function _ContactDrawer(props: IContactDrawerProps) {
  const { store } = props
  return (
    <Drawer
      title={store.title}
      className="contact-drawer-wrapper"
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
            <Form.Item labelAlign="left"
              label={
                <span>
                  已有联系人信息
                  <Tooltip title={
                    <span>
                      可在下拉列表中选择已保存至
                      <Link to="/certificate/ssl#info" target="_blank">SSL证书服务-我的信息</Link>
                      中的联系人信息。
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
                onChange={(contactId: string) => store.handleContactSelectChange(contactId)}
              >
                {
                  store.contactList.map(contact => (
                    <Select.Option key={contact.id} value={contact.id}>{contact.remarkName}{contact.isDefault && ' (默认)'}</Select.Option>
                  ))
                }
              </Select>
            </Form.Item>
          )
        }
        <ContactForm state={store.formState} needRemarkName={!store.useOnly} />
      </Spin>
    </Drawer>
  )
})

enum LoadingType {
  GetContactList = 'GetContactList'
}

export interface IUserInfoWithUseOnly extends IContact {
  useOnly: boolean
}

export class ContactDrawerStore extends DrawerStore<IContact, IUserInfoWithUseOnly> {
  constructor(
    toasterStore: ToasterStore,
    private sslApis: SslApis
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, toasterStore)
  }

  loading = Loadings.collectFrom(this, LoadingType)

  @observable.ref formState: IState = createState(undefined, () => !this.useOnly)
  @observable.ref contactList: IContact[] = []
  @observable useOnly = true

  @computed get isLoading() {
    return !this.loading.isAllFinished()
  }

  @computed get title() {
    return this.drawerState.isModify ? '编辑联系人信息' : '创建联系人信息'
  }

  @action updateContactList(contactList: IContact[]) {
    this.contactList = contactList || []
  }

  @action updateUseOnly(useOnly: boolean) {
    this.useOnly = useOnly
  }

  handleContactSelectChange(contactId: string) {
    this.updateExtra(this.contactList.find(item => item.id === contactId)!)
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
  @Loadings.handle(LoadingType.GetContactList)
  fetchContactList() {
    return this.sslApis.getContactList().then(({ list }) => this.updateContactList(list))
  }

  init() {
    this.addDisposer(reaction(
      () => this.extra,
      contact => {
        this.formState = createState(contact, () => !this.useOnly)
      }
    ))

    this.addDisposer(() => this.formState.dispose())

    // 每次打开 drawer 时，拉取数据
    this.addDisposer(reaction(
      () => this.visible && this.drawerState.isModify,
      shouldFetch => {
        if (shouldFetch) {
          this.fetchContactList()
        }
      }
    ))
  }
}
