/**
 * @file tags apis
 * @author linchen <gakiclin@gmail.com>
 */

import { injectable } from 'qn-fe-core/di'

import DomainProxyClient from './clients/domain-proxy'

export interface DomainTagInfo {
  domain: string
  tagList: string[]
}

@injectable()
export default class TagApis {
  constructor(private client: DomainProxyClient) {}

  getTags() {
    return this.client.get('/domain/all/tags', null, { withProduct: true }).then<string[]>(
      (resp: { tagList: string[] }) => (resp.tagList || [])
    )
  }

  createTag(tag: string) {
    return this.client.post<void>('/domain/tag', { tag }, { withProduct: true })
  }

  updateDomainTags(domain: string, tagList: string[]) {
    return this.client.put<void>(`/domain/${domain}/tags`, { tagList }, { withProduct: true })
  }

  batchGetDomainTags(domains: string[]) {
    return this.client.get('/domain/tags', { domains }).then<DomainTagInfo[]>(
      (resp: { list: DomainTagInfo[] }) => (resp.list || [])
    )
  }
}
