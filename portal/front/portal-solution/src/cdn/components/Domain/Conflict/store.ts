
import { observable, computed, action } from 'mobx'
import autobind from 'autobind-decorator'

import { RouterStore } from 'portal-base/common/router'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore } from 'portal-base/common/toaster'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { saveFile } from 'cdn/utils/file'

import { asteriskWildcardDomain } from 'cdn/constants/pattern'

import ConflictApis from 'cdn/apis/conflict'
import DomainApis from 'cdn/apis/domain'

@injectable()
export default class LocalStore extends Store {
  @observable domain!: string
  fileName = 'verifyingfile.html'
  @observable conflictDomain!: string
  @observable findDomain!: string
  @observable fileContent!: string
  @observable verifyResult!: string

  loadings = new Loadings('verify', 'state', 'file')

  constructor(
    private routerStore: RouterStore,
    private conflictApis: ConflictApis,
    private domainApis: DomainApis
  ) {
    super()
  }

  @computed get isLoading() {
    return this.loadings.isLoading('state') || this.loadings.isLoading('file')
  }

  @computed get isSubmitting() {
    return this.loadings.isLoading('verify')
  }

  @computed get conflictWithWildcardDomain() {
    return this.conflictDomain && asteriskWildcardDomain.test(this.conflictDomain)
  }

  @action.bound getTargetDomain() {
    const query = this.routerStore.query
    if (query && query.domain) {
      this.domain = query.domain as string
    }
  }

  @action.bound updateVerifyResult(result: 'success' | 'error') {
    this.verifyResult = result
  }

  @action.bound updateConflictDomain(domain: string) {
    this.conflictDomain = domain
  }

  @action.bound updateFindDomain(domain: string) {
    this.findDomain = domain
  }

  @action.bound updateFileContent(file: string) {
    this.fileContent = file
  }

  @ToasterStore.handle()
  fetchDomainState() {
    return this.loadings.promise('state', this.domainApis.getDomainState(this.domain).then(
      data => this.updateConflictDomain(data.conflictDomain)
    ))
  }

  @ToasterStore.handle()
  fetchFileContent() {
    return this.loadings.promise('state', this.conflictApis.getVerifyFile(this.conflictDomain).then(
      data => {
        this.updateFileContent(data.msg)
        this.updateFindDomain(data.findDomain)
      }
    ))
  }

  init() {
    this.getTargetDomain()

    this.fetchDomainState().then(
      () => this.fetchFileContent()
    )
  }

  @autobind downloadFile() {
    saveFile(this.fileName, this.fileContent)
  }

  @ToasterStore.handle()
  submitVerify() {
    const conflictDomain = (
      this.conflictWithWildcardDomain
      ? this.conflictDomain.slice(1)
      : this.conflictDomain
    )

    const req = this.conflictApis.verifyDomain({ conflictDomain }).then(
      _ => {
        this.updateVerifyResult('success')
        this.routerStore.goBack()
      },
      error => {
        this.updateVerifyResult('error')
        return Promise.reject(error)
      }
    )
    return this.loadings.promise('verify', req)
  }
}
