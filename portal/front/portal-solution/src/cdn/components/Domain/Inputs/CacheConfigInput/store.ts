/*
 * @file StateStore for 域名缓存配置
 * @author nighca <nighca@live.cn>
 */

import { action, reaction } from 'mobx'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { isM3u8CacheControl, getRecommendedCacheControls, getDefaultCacheControlForTypeCustomize } from 'cdn/transforms/domain'

import AbilityConfig from 'cdn/constants/ability-config'
import { cacheControlForM3u8NoCache, cacheControlTimeunits, CacheType, CacheControlType } from 'cdn/constants/domain'

import { SortEnd } from 'cdn/components/common/Sortable'

import { ICacheControl } from 'cdn/apis/domain'

import { Props } from '.'

@injectable()
export default class LocalStore extends Store {

  constructor(
    @injectProps() private props: Props,
    private toaster: Toaster,
    public abilityConfig: AbilityConfig
  ) {
    super()
  }

  init() {
    // 如果是新建，并且是七牛私有 bucket：选中自定义，添加 m3u8 不缓存的配置项
    this.addDisposer(reaction(
      () => {
        const props = this.props
        return !props.modify && props.isQiniuPrivate
      },
      shouldAddCacheControlForM3u8NoCache => {
        if (shouldAddCacheControlForM3u8NoCache) {
          const { cacheType, cacheControls } = this.props.state.$.$
          cacheType.set(CacheType.Customize)
          cacheControls.set([
            cacheControlForM3u8NoCache,
            ...cacheControls.value.filter(
              cacheControl => !isM3u8CacheControl(cacheControl)
            )
          ])
        }
      }, {
        fireImmediately: true
      }
    ))

    this.addDisposer(reaction(
      () => this.props.state.$.$.cacheType.value,
      cacheType => {
        if (cacheType === CacheType.Customize) {
          const { cacheControls } = this.props.state.value
          if (cacheControls.length === 0) {
            const platform = this.props.domain.platform
            const defaultCacheControl = getDefaultCacheControlForTypeCustomize(platform)
            this.props.state.$.$.cacheControls.set([defaultCacheControl])
          }
        }
      }
    ))
  }

  @action addCacheControl(cacheControl: ICacheControl) {
    const cacheControlsState = this.props.state.$.$.cacheControls
    const cacheControls = cacheControlsState.value
    const cacheControlsExceptUnknown = cacheControls.filter(
      ({ type }) => type !== CacheControlType.Unknown
    )
    if (cacheControlsExceptUnknown.length >= 15) {
      this.toaster.warning('最多能添加 15 条记录')
      return
    }
    cacheControlsState.insert(0, cacheControl)
  }

  @action.bound handleRemoveCacheControl(index: number) {
    this.props.state.$.$.cacheControls.remove(index)
  }

  @action.bound handleUseRecommendedCacheControls() {
    const platform = this.props.domain.platform
    const isQiniuPrivate = this.props.isQiniuPrivate
    const recommendedCacheControls = getRecommendedCacheControls(platform, isQiniuPrivate)
    const defaultCacheControl = getDefaultCacheControlForTypeCustomize(platform)

    // 这里在 onChange 前先清空下 cache controls 列表，避免 formstate-x 复用原有的 cache control state
    // 如若复用原有的 cache control state（是 debounced state），onChange 对值的设置会有延迟，导致瞬间的错误提示
    this.props.state.$.$.cacheControls.onChange([])
    if (this.abilityConfig.useStaticCacheConfig) {
      this.props.state.$.$.cacheControls.onChange(recommendedCacheControls)
    } else {
      this.props.state.$.$.cacheControls.onChange([...recommendedCacheControls, defaultCacheControl])
    }
  }

  @action.bound handleAddSuffixCacheControl() {
    this.addCacheControl({
      time: 30,
      timeunit: cacheControlTimeunits.day,
      type: CacheControlType.Suffix,
      rule: ''
    })
  }

  @action.bound handleAddPathCacheControl() {
    this.addCacheControl({
      time: 30,
      timeunit: cacheControlTimeunits.day,
      type: CacheControlType.Path,
      rule: ''
    })
  }

  @action.bound handleCacheControlSortEnd({ oldIndex, newIndex }: SortEnd) {
    this.props.state.$.$.cacheControls.move(oldIndex, newIndex)
  }
}
