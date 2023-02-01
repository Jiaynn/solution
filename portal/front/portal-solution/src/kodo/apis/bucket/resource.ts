/**
 * @file api functions for bucket-resource
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { InvalidOutputPayloadException } from 'qn-fe-core/client'
import { UserInfoStore } from 'portal-base/user/account'
import { CommonClient } from 'portal-base/common/apis/common'
import { ReservedModes, StorageType } from 'kodo-base/lib/constants'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'
import { KodoProxyApiException, KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { encodeUrlSafeBase64 } from 'kodo/transforms/base64'
import { getEncodedEntryURI, IEncodedEntryURIOptions } from 'kodo/transforms/bucket/resource'

import { ConfigStore } from 'kodo/stores/config'

import { ArchiveStatus, FileStatus, MetaStatus } from 'kodo/constants/bucket/resource'
import { kodov2, pili, proxy } from 'kodo/constants/apis'

import { BucketApis } from './index'

export interface IFileResourceOptions {
  bucket: string
  allversion: boolean
  delimiter?: string
  baseUrl?: string
  limit: number
  marker?: string
  prefix: string
}

export interface IFileResource {
  items: IFileBase[]
  has_sensitive_words: boolean
  marker: string
  commonPrefixes: string[]
}

export interface IFileBase {
  key: string
  hash: string
  fsize: number
  putTime: number
  mimeType: string
  type: number
  version?: string
  status?: FileStatus
  deleteMarker: boolean
  preview_url: string           // 预览地址
  download_url: string          // 下载地址
  'x-qn-meta': IXQnMeta
  objectLockEnabled?: 'Enabled' // 对象锁定是否开启
  lockMode?: ReservedModes      // 对象锁定模式
  retainUntilDate?: number      // 对象锁定保留截止时间
}

export interface IFileStat extends IFileBase {
  restoreStatus: ArchiveStatus
  expiration?: number
  'server-side-encryption'?: string
}

export interface IVerifyFile {
  limit: boolean
}

export interface IXQnMeta {
  [key: string]: string
}

export interface IMeta {
  name: string
  value: string
  status: MetaStatus
}

export interface IUptoken {
  up_token: string
}

export interface ISensitiveWord {
  has_sensitive_word: boolean
}

export interface IThrawArchiveOptions {
  bucket: string
  fileName: string // 文件名
  freezeAfterDays: number // 冻结时间
  cond?: string // 冻结条件，这里暂不用
}

const renameFileErrors = {
  612: '文件不存在',
  614: '目标文件名已存在'
}

// TODO: 很多服务文档没有说明可能返回的 code
// TODO：通过自定义 client._send 支持接口自定义 errorMassage
// https://github.com/qbox/kodo/blob/develop/src/qiniu.com/kodo/rs/rs2/rs_svr.go#L3076
const deleteFileErrors = {
  612: '文件不存在',
  613: '规则导致无法删除',
  403: '当前文件状态无法操作', // WORM
  412: '不能删除当前文件的最新版本'
}

@autobind
@injectable()
export class ResourceApis {
  constructor(
    private bucketApis: BucketApis,
    private configStore: ConfigStore,
    private userInfoStore: UserInfoStore,
    private commonClient: CommonClient,
    private kodoProxyClient: KodoProxyClient,
    private kodoCommonClient: KodoCommonClient
  ) { }

  getFileResource(options: IFileResourceOptions): Promise<IFileResource> {
    return this.kodoCommonClient.get(kodov2.getFiles, options)
  }

  getSignedDownloadUrl(url: string): Promise<string> {
    return this.getSignedDownloadUrls([url], 3600).then(list => {
      if (!Array.isArray(list) || list.length !== 1) {
        throw new InvalidOutputPayloadException('invalid response')
      }
      return list[0]
    })
  }

  getSignedDownloadUrls(urls: string[], expiredAfter: number): Promise<string[]> {
    const options = {
      urls: urls.join(','),
      expiredAfter
    }
    return this.kodoCommonClient.get(`${kodov2.downloadUrl}`, options)
  }

  getFileState(
    bucket: string,
    options: IEncodedEntryURIOptions,
    baseUrl?: string
  ): Promise<IFileStat> {
    const encodedEntryURI = getEncodedEntryURI(bucket, options)
    const baseAddress = `${proxy.getFileState}/${encodedEntryURI}`

    const url = baseUrl
      ? `${baseAddress}/baseurl/${encodeUrlSafeBase64(baseUrl)}`
      : baseAddress
    return this.kodoProxyClient.get(url, {})
  }

  setFileStatus(bucket: string, options: IEncodedEntryURIOptions, status: FileStatus): Promise<void> {
    const encodedEntryURI = getEncodedEntryURI(bucket, options)

    return this.kodoProxyClient.post(proxy.changeFileStatus + '/' + encodedEntryURI + '/status/' + status, {})
  }

  // 文件是否可用
  // 包含条件：文件是否存在、是否包含 deleteMarker 标记
  isFileAvailable(
    bucket: string,
    options: IEncodedEntryURIOptions
  ): Promise<boolean> {
    const encodedEntryURI = getEncodedEntryURI(bucket, options)
    const baseAddress = `${proxy.getFileState}/${encodedEntryURI}`
    return this.kodoProxyClient.get<IFileStat>(baseAddress, {})
      .then(result => result.deleteMarker !== true)
      .catch((e: unknown) => {
        if (e instanceof KodoProxyApiException && (e.httpCode as number) === 612) {
          return false
        }

        throw e
      })
  }

  renameFileMimeType(bucket: string, mimeType: string, options: IEncodedEntryURIOptions): Promise<void> {
    const encodedEntryURI = getEncodedEntryURI(bucket, options)
    const encodedURIMime = encodeUrlSafeBase64(mimeType)

    return this.kodoProxyClient.post(
      `${proxy.renameFileMimeType}/${encodedEntryURI}/mime/${encodedURIMime}`,
      {}
    )
  }

  renameFileKey(
    bucket: string,
    newKey: string,
    oldKey: string
  ): Promise<{ version: string } | undefined> {
    const oldEncodedEntryURI = getEncodedEntryURI(bucket, { key: oldKey })
    const newEncodedEntryURI = getEncodedEntryURI(bucket, { key: newKey })

    return this.kodoProxyClient.post<{ version: string } | undefined>(
      `${proxy.renameFileKey}/${oldEncodedEntryURI}/${newEncodedEntryURI}`,
      {}
    ).catch((e: unknown) => {
      if (e instanceof KodoProxyApiException) {
        throw e.withMessage(renameFileErrors[e.code])
      }

      throw e
    })
  }

  moveFile(
    sourceBucket: string,
    sourceKey: string,
    targetBucket: string,
    targetKey: string
  ): Promise<void> {
    const oldEncodedEntryURI = getEncodedEntryURI(sourceBucket, { key: sourceKey })
    const newEncodedEntryURI = getEncodedEntryURI(targetBucket, { key: targetKey })

    return this.kodoProxyClient.post<void>(
      `${proxy.renameFileKey}/${oldEncodedEntryURI}/${newEncodedEntryURI}`,
      {}
    ).catch((e: unknown) => {
      if (e instanceof KodoProxyApiException) {
        throw e.withMessage(renameFileErrors[e.code])
      }

      throw e
    })
  }

  hasSensitiveWord(key: string): Promise<ISensitiveWord> {
    return this.kodoCommonClient.get(kodov2.hasSensitive, { key })
  }

  deleteFileResource(
    bucket: string,
    params: IEncodedEntryURIOptions
  ): Promise<void> {
    const encodedEntryURI = getEncodedEntryURI(bucket, params)

    return this.kodoProxyClient.post<void>(
      `${proxy.deleteFileResource}/${encodedEntryURI}`,
      {}
    ).catch((e: unknown) => {
      if (e instanceof KodoProxyApiException) {
        // 文件不存在，对于删除而言，结果是一样的，视为删除成功
        if ((e.httpCode as number) === 612) return
        throw e.withMessage(deleteFileErrors[e.code])
      }

      throw e
    })
  }

  getFileVersionList(bucket: string, key: string): Promise<string[]> {

    const versions: string[] = []

    const fileParams: IFileResourceOptions = {
      bucket,
      allversion: true,
      marker: undefined,
      prefix: key,
      limit: 50
    }

    const getVersions = async () => {
      const result = await this.getFileResource(fileParams)

      result.items.forEach(file => {
        if (file.key === key && file.version && !file.deleteMarker) {
          versions.push(file.version)
        }
      })

      if (result.marker) {
        fileParams.marker = result.marker
        await getVersions()
      }
    }

    return getVersions().then(() => versions)
  }

  updateFileMeta(
    bucket: string,
    key: IEncodedEntryURIOptions,
    qnMeta: IMeta[]
  ): Promise<void> {

    const encodedEntryURI = getEncodedEntryURI(bucket, key)

    const metaEncodedArray: string[] = ([] as string[]).concat(
      ...qnMeta.map(item => [`x-qn-meta-${item.name}`, encodeUrlSafeBase64(item.value)])
    )

    const fullURL = `${proxy.updateFileMeta}/${encodedEntryURI}/${metaEncodedArray.join('/')}`

    return this.kodoProxyClient.post(fullURL, {})
  }

  hasFile(bucketName: string): Promise<boolean> {
    const bucketPromise = this.bucketApis.getBucketDetailsByName(bucketName)
    const filesPromise = this.getFileResource({ limit: 1, marker: '', prefix: '', allversion: false, bucket: bucketName })

    return filesPromise.then(
      files => !!(files && files.items && files.items.length),
      () => bucketPromise.then(bucket => !!(bucket && bucket.file_num))
    )
  }

  // 转换文件存储方式，1 代表转为低频，0 代表转为标准
  transformStorageType(bucket: string, key: IEncodedEntryURIOptions, type: StorageType): Promise<void> {
    const encodedEntryURI = getEncodedEntryURI(bucket, key)
    return this.kodoProxyClient.post(`${proxy.transformStorageType}/${encodedEntryURI}/type/${type}`, {})
  }

  // 查看空间是否被 pili 调用
  async isPiliUsed(bucketName: string): Promise<boolean> {
    // pili 不存在则无需检查
    const globalConfig = this.configStore.getFull()
    if (!globalConfig.pili.enable) {
      return false
    }

    if (!this.userInfoStore.isPiliUser) {
      return false
    }

    const hubs = await this.commonClient.get<any>(`${pili.hubsByBucket}/${bucketName}`, {})
    return !!(hubs && hubs.length)
  }

  thrawArchiveFile(options: IThrawArchiveOptions) {
    const encodedEntryURI = getEncodedEntryURI(options.bucket, { key: options.fileName })
    return this.kodoProxyClient.post<void>(`${proxy.thrawArchiveFile}/${encodedEntryURI}/freezeAfterDays/${options.freezeAfterDays}`, {})
  }
}
