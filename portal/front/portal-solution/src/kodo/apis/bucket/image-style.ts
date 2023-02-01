/**
 * @file api functions for image-style
 * @author zhangheng <zhangheng01@qiniu.com>
 * @todo 重命名为多媒体样式
 */

import { uniq, uniqBy } from 'lodash'
import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { HttpClient, JsonClient } from 'qn-fe-core/client'

import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'

import { encodeUrlSafeBase64 } from 'kodo/transforms/base64'

import { kodov2, proxy, service } from 'kodo/constants/apis'

import { MediaStyleType } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/constants'

export interface MediaStyle {
  name: string // 样式名
  commands: string // 命令
  update_time?: string // 更新时间
  persistence_enable?: boolean // 自动保存是否开启
}

export interface ImageInfo {
  format: string
  height: number
  size: number
  width: number
}

// 水印
export interface Watermark {
  id: number
  command: string
  lastUsedTime: number
}

// 转码预设
export enum PresetType {
  Transcode = 'transcode',
  Smart = 'smart',
  Watermark = 'watermark',
  Screenshot = 'screenshot',
  Concat = 'concat'
}

export enum PresetOwner {
  System = 'system',
  Custom = 'custom'
}

export const presetOwnerText = {
  [PresetOwner.System]: '系统预设',
  [PresetOwner.Custom]: '自定义预设'
}

export interface Preset<P> {
  id: string
  name: string
  params?: P
  owner?: PresetOwner
  type?: PresetType
  region?: string
  status?: string
  version?: string
  created_at?: string
  updated_at?: string
}

export type TranscodePreset = Preset<{
  s: string // 分辨率
  vb: string // 码率
  format: string // 输出格式
  // 还有很多其他内容，暂时用不到就不定义了
}>

export function hasResponse(res: unknown): res is { response: Response } {
  // eslint-disable-next-line dot-notation
  return !!(res && typeof res === 'object' && 'response' in res && res['response'] instanceof Response)
}

@autobind
@injectable()
export class ImageStyleApis {
  constructor(
    private httpClient: HttpClient,
    private jsonClient: JsonClient,
    private kodoProxyClient: KodoProxyClient,
    private kodoCommonClient: KodoCommonClient
  ) { }

  setSeparator(bucketName: string, sep: string) {
    return this.kodoProxyClient.post(`${proxy.setSeparator}/${bucketName}/sep/${encodeUrlSafeBase64(sep)}`, {})
  }

  /**
   * @param  {string} key
   * @description 获取用户自定义上传图片进行预览时上传所用的 token
   */
  getUploadInfo(key: string): Promise<{ uploadToken: string, uploadHost: string, downloadHost: string }> {
    const params = {
      key,
      product: 'kodo'
    }
    return this.kodoCommonClient.get(kodov2.doraImage, params)
  }

  /**
   * @param  {string} bucketName
   * @description 获取指定空间的多媒体样式列表
   */
  async getImageStyles(bucketName: string): Promise<MediaStyle[]> {
    const response = await this.kodoProxyClient.get<{ styles: MediaStyle[] }>(`${service.uc}/buckets/${bucketName}/style`)
    // 服务端返回结果不稳定，在这里做一下排序
    return response.styles.sort((a, b) => a.name.localeCompare(b.name))
  }

  /**
   * @param  {string} bucketName
   * @param  {string} name
   * @description 删除指定空间下指定名称的多媒体样式（老接口）
   */
  deleteImageStyle(bucketName: string, name: string) {
    return this.kodoProxyClient.post(`${proxy.deleteImageStyle}/${bucketName}/name/${encodeUrlSafeBase64(name)}`, {})
    // return this.kodoProxyClient.delete(`${service.uc}/buckets/${bucketName}/style?name=${name}`, {
    // })
  }

  /**
   * @param  {string} bucketName
   * @param  {string} name
   * @description 删除指定空间下指定名称的多媒体样式（新接口）
   */
  deleteMediaStyle(bucketName: string, name: string) {
    return this.kodoProxyClient.delete(`${service.uc}/buckets/${bucketName}/style?name=${name}`, {
    })
  }

  /**
   * @param  {string} bucketName
   * @param  {MediaStyle[]} styleList
   * @description 批量删除指定空间下指定名称的多媒体样式（新接口）
   */
  async deleteMediaStyles(bucketName: string, styleList: MediaStyle[]) {
    const oldStyles = await this.getImageStyles(bucketName)
    if (oldStyles.length === styleList.length) {
      // 如果是全部删除则直接调用清空的接口去删除
      return this.kodoProxyClient.delete(`${service.uc}/buckets/${bucketName}/style`, {
      })
    }

    // 不是删除全部则通过 put 接口去更新数据
    const deletedNameSet = new Set(styleList.map(i => i.name))
    return this.kodoProxyClient.put(`${service.uc}/buckets/${bucketName}/style`, {
      styles: oldStyles.filter(i => !deletedNameSet.has(i.name))
    })
  }

  async saveImageStyle(bucketName: string, styleList: MediaStyle[], type?: MediaStyleType): Promise<MediaStyle[]> {
    const oldStyles = await this.getImageStyles(bucketName)

    const saveMostUsedWatermarks = () => {
      if (type !== MediaStyleType.VideoWatermark) {
        return
      }

      const head = styleList[0].commands.replace(/(wmText|wmImage).*/, '')

      // 以 wmText|wmImage 开头的水印命令
      const commandStrList = styleList[0].commands.split(/(?=wmText|wmImage)/)
        .map(item => item.replace(/(.*)\/$/, '$1'))
        .filter(item => item.startsWith('wmText') || item.startsWith('wmImage'))

      const commands = uniq(commandStrList).map(item => `${head}${item}`)

      if (!commands.length) {
        return
      }

      this.saveMostUsedWatermarks(commands)
    }

    const all = uniqBy([...styleList, ...oldStyles], 'name')

    return this.kodoProxyClient.put(`${service.uc}/buckets/${bucketName}/style`, {
      styles: all
    }).then(() => {
      saveMostUsedWatermarks()
      return all
    })
  }

  getImageInfo(src: string): Promise<ImageInfo> {
    if (src[src.length - 1] === '?') {
      src = src.substring(0, src.length - 1)
    }
    const url = `${src}${src.includes('?') ? '|' : '?'}imageInfo`
    return this.jsonClient.fetch(url, { credentials: 'omit', mode: 'cors' })
  }

  /**
   * @desc 获取转码预设列表
   */
  getTranscodePreset(): Promise<TranscodePreset[]> {
    return this.kodoProxyClient.get(proxy.getTranscodePreset)
  }

  getResource(src: string): Promise<Response> {
    return this.httpClient.send(src, { credentials: 'same-origin', mode: 'cors' }).then(res => res.response)
  }

  /**
   * @desc 获取常用水印
   */
  getMostUsedWatermarks(): Promise<Array<Omit<Watermark, 'id'> & { id: string }>> {
    return this.kodoCommonClient.get<Watermark[]>(kodov2.watermark)
      .then(res => (Array.isArray(res)
        ? res.map((item, idx) => ({ ...item, id: idx + '' })).slice(0, 5)
        : []
      ))
  }

  /**
   * @desc 保存常用水印
   */
  saveMostUsedWatermarks(commands: string[]) {
    return this.kodoCommonClient.post(kodov2.watermark, { commands })
  }
}
