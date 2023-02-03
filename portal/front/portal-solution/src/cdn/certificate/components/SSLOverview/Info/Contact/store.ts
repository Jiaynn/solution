/*
 * @file store of Company
 * @author zhu hao <zhuhao@qiniu.com>
 */

import { observable, action, computed } from 'mobx'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import Modal from 'react-icecream/lib/modal'
import Store, { observeInjectable } from 'qn-fe-core/store'

import SslApis, { IBaseContact, IContact } from '../../../../apis/ssl'
import {
  IState as ISearchState,
  createState as createSearchState,
  getValue as getSearchValue
} from '.'
import { ContactDrawerStore } from './Drawer'

enum LoadingType {
  GetContactList = 'GetContactList',
  AddContact = 'AddContact',
  ModifyContact = 'ModifyContact',
  DeleteContact = 'DeleteContact',
}

@observeInjectable()
export default class StateStore extends Store {

  loading = Loadings.collectFrom(this, LoadingType)

  constructor(
    toasterStore: ToasterStore,
    private sslApis: SslApis
  ) {
    super()
    ToasterStore.bindTo(this, toasterStore)
  }

  drawerStore = new ContactDrawerStore()

  @observable.ref searchState: ISearchState = createSearchState()
  @observable.ref contactList: IContact[] = []
  @observable.ref selectedContactList: IContact[] = []

  @computed get isLoading() {
    return !this.loading.isAllFinished()
  }

  @computed get selectedDeleteDisabled() {
    return this.selectedContactList.length === 0
  }

  @computed get filteredContactList() {
    const { field, keyword } = getSearchValue(this.searchState)
    return this.contactList
      .filter((contact: any) => !contact[field] || !keyword || contact[field].indexOf(keyword) >= 0)
      .sort((_, contact) => (contact.isDefault ? 1 : -1))
  }

  @action updateContactList(contactList: IContact[]) {
    this.contactList = contactList || []
  }

  @action updateSelectedContactList(contactList: IContact[]) {
    this.selectedContactList = contactList || []
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetContactList)
  fetchContactList() {
    return this.sslApis.getContactList().then(
      res => this.updateContactList(res.list)
    )
  }

  @Loadings.handle(LoadingType.AddContact)
  addContactInfo(contact: IBaseContact) {
    return this.sslApis.addContact(contact)
  }

  @Loadings.handle(LoadingType.ModifyContact)
  modifyContactInfo(contact: IContact) {
    return this.sslApis.modifyContact(contact)
  }

  @Loadings.handle(LoadingType.DeleteContact)
  deleteContactList(ids: string[]) {
    return this.sslApis.deleteContactList({ ids })
  }

  @ToasterStore.handle()
  handleDeleteContact(ids: string[]) {
    return this.deleteContactList(ids)
      .then(() => { this.fetchContactList() })
  }

  openDeleteConfirm(id: string) {
    Modal.confirm({
      title: '温馨提示',
      content: '确认要删除该联系人信息吗？',
      onOk: () => this.handleDeleteContact([id])
    })
  }

  @ToasterStore.handle()
  openAddContactDrawer() {
    return this.drawerStore.open()
      .then(contact => this.addContactInfo(contact))
      .then(() => { this.fetchContactList() })
  }

  @ToasterStore.handle()
  openModifyContactDrawer(contact: IContact) {
    return this.drawerStore.open(true, contact)
      .then(newContact => this.modifyContactInfo(newContact))
      .then(() => { this.fetchContactList() })
  }

  openDeleteSelectedContactModal() {
    Modal.confirm({
      title: '温馨提示',
      content: '确认要删除选中的联系人信息吗？',
      onOk: () => this.handleDeleteContact(this.selectedContactList.map(contact => contact.id!))
    })
  }

  init() {
    this.fetchContactList()
  }

}
