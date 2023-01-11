/*
 * @file store of Company
 * @author zhu hao <zhuhao@qiniu.com>
 */

import { observable, action, computed } from 'mobx'

import Store, { observeInjectable } from 'qn-fe-core/store'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import Modal from 'react-icecream/lib/modal'

import SslApis, { ICompany, IBaseCompany } from '../../../../apis/ssl'
import {
  IState as ISearchState,
  createState as createSearchState,
  getValue as getSearchValue
} from '.'
import { CompanyDrawerStore } from './Drawer'

enum LoadingType {
  GetCompanyList = 'GetCompanyList',
  AddCompany = 'AddCompany',
  ModifyCompany = 'ModifyCompany',
  DeleteCompany = 'DeleteCompany'
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

  drawerStore: CompanyDrawerStore = new CompanyDrawerStore()

  @observable.ref searchState: ISearchState = createSearchState()
  @observable.ref companyList: ICompany[] = []
  @observable.ref selectedCompanyList: ICompany[] = []

  @computed get isLoading() {
    return !this.loading.isAllFinished()
  }

  @computed get selectedDeleteDisabled() {
    return this.selectedCompanyList.length === 0
  }

  @computed get filteredCompanyList() {
    const { field, keyword } = getSearchValue(this.searchState)
    return this.companyList
      .filter((company: any) => !company[field] || !keyword || company[field].indexOf(keyword) >= 0)
      .sort((_, company) => (company.isDefault ? 1 : -1))
  }

  @action updateCompanyList(companyList: ICompany[]) {
    this.companyList = companyList || []
  }

  @action updateSelectedCompanyList(companyList: ICompany[]) {
    this.selectedCompanyList = companyList || []
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetCompanyList)
  fetchCompanyList() {
    return this.sslApis.getCompanyList().then(
      data => this.updateCompanyList(data.list)
    )
  }

  @Loadings.handle(LoadingType.AddCompany)
  addCompany(company: IBaseCompany) {
    return this.sslApis.addCompany(company)
  }

  @Loadings.handle(LoadingType.ModifyCompany)
  modifyCompany(company: ICompany) {
    return this.sslApis.modifyCompany(company)
  }

  @ToasterStore.handle()
  handleDeleteCompany(ids: string[]) {
    return this.deleteCompany(ids)
      .then(() => { this.fetchCompanyList() })
  }

  @Loadings.handle(LoadingType.DeleteCompany)
  deleteCompany(ids: string[]) {
    return this.sslApis.deleteCompanyList({ ids })
  }

  openDeleteConfirm(id: string) {
    Modal.confirm({
      title: '温馨提示',
      content: '确认要删除该公司信息吗？',
      onOk: () => this.handleDeleteCompany([id])
    })
  }

  @ToasterStore.handle()
  openAddCompanyDrawer() {
    return this.drawerStore.open()
      .then(company => this.addCompany(company))
      .then(() => { this.fetchCompanyList() })
  }

  @ToasterStore.handle()
  openModifyCompanyDrawer(company: ICompany) {
    return this.drawerStore.open(true, company)
      .then(newCompany => this.modifyCompany(newCompany))
      .then(() => { this.fetchCompanyList() })
  }

  openDeleteSelectedCompanyModal() {
    Modal.confirm({
      title: '温馨提示',
      content: '确认要删除选中的公司信息吗？',
      onOk: () => this.handleDeleteCompany(this.selectedCompanyList.map(contact => contact.id!))
    })
  }

  init() {
    this.fetchCompanyList()
  }

}
