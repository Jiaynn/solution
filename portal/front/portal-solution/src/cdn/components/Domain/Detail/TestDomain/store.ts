import { observeInjectable as injectable } from 'qn-fe-core/store'
import { injectProps } from 'qn-fe-core/local-store'
import { UserInfoStore } from 'portal-base/user/account'

import DomainStore from 'cdn/stores/domain'

import DomainApis from 'cdn/apis/domain'

import BaseStateStore, { IBaseDomainDetailProps } from '../common/store'

@injectable()
export default class LocalStore extends BaseStateStore {
  constructor(
    @injectProps() protected props: IBaseDomainDetailProps,
    protected domainApis: DomainApis,
    protected domainStore: DomainStore,
    protected userInfoStore: UserInfoStore
  ) {
    super(() => props, domainApis, domainStore, userInfoStore)
  }

  removeDomain() {
    const req = this.domainApis.deleteDomain(this.name)
    return this.loadings.promise('removeDomain', req)
  }
}
