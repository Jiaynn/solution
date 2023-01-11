/**
 * @file card of max age of bucket setting 文件缓存
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// TODO: 其实还是半成品
// TODO: 降低复杂度和维护成本
// 注：这是一个试验品，用来验证空间设置、或者更复杂的全局 mobx + react 的正确实现 / 使用形态
// 但是只会在这个控件里实现得相对完备，空间设置其他功能
// 这件事本应该在项目刚开始的时候就确定下来
// kodo admin 空间设置页的各种充满 bug 的实现告诉了我们，正确的实现对开发者的要求是不低的
// 但是项目成员们对此都持乐观态度，@nighca 也认为如果连这里的复杂度大家都应对不了，那么还用什么 mobx
// 那么我们就再实践一次好了，总的来说我是持悲观态度的（从 review 情况 和 空间管理 tab / bucket 切换的实现 看）
// 哪怕是只从当前的业务模型 + 前端实现看，这东西依然只是能跑而已
// 只是很原始的刀耕火种的状态，成熟度过低，很多东西还处于人肉保证正确性的状态，没有方法论，经验也不可复制、推广
// 当然，从结果上说还是比 kodo admin 好多了，但是达到目前效果的成本已经远远超出预期了
// 至于为什么挑这个来搞实验，因为这个业务上最简单，因此最容易接受业务以外的复杂度（系统复杂度）

import * as React from 'react'
import { observer } from 'mobx-react'
import { observable, action, computed, reaction, when, makeObservable } from 'mobx'
import { FieldState, FormState } from 'formstate'
import autobind from 'autobind-decorator'

import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Form, Spin, InputNumber } from 'react-icecream/lib'

import { ValidatableObject, bindFormItem, getValuesFromFormState } from 'kodo/utils/formstate'
import { InputNumberValue, bindInputNumberField } from 'kodo/utils/formstate/bind'
import { valuesOfEnum } from 'kodo/utils/ts'

import { BucketStore } from 'kodo/stores/bucket'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { defaultMaxAge } from 'kodo/constants/bucket/setting/max-age'

import { Auth } from 'kodo/components/common/Auth'

import { MaxAgeApis } from 'kodo/apis/bucket/setting/max-age'

import SettingCard from '../Card'
import SettingCardFooter from '../Card/Operators'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

enum Loading {
  GetMaxAge = 'getMaxAge',
  SetMaxAge = 'setMaxAge'
}

interface IApiValues {
  maxAge: number
}

interface IFormValues {
  maxAge: InputNumberValue
}

function createFormState(initFormValues?: Partial<IApiValues>) {
  const formValues = {
    maxAge: defaultMaxAge, // 这种处理的是字段有无
    ...initFormValues
  }

  return new FormState<ValidatableObject<IFormValues>>({
    // 这种处理的是缺省值
    maxAge: new FieldState(formValues.maxAge || defaultMaxAge).validators(
      value => (value == null || !String(value).trim()) && '不能为空',
      value => typeof value === 'string' && /\s/.test(value) && '不能输入空格等空白符',
      num => (!Number.isInteger(num) || num < 1) && '请输入正整数',
      maxAge => maxAge >= 2 ** 31 && `不能超过 ${2 ** 31 - 1}`
    )
  })
}

@observer
class InternalSettingMaxAge extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  maxAgeApis = this.props.inject(MaxAgeApis)
  bucketStore = this.props.inject(BucketStore)

  // ================
  // 把下面这几个东西简单地形式化、套路化以降低复用成本

  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  @observable isReady = false
  @observable isDirty = false
  @observable isDisposed = false
  disposable = new Disposable()

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  // ================

  @observable.ref formState: FormState<ValidatableObject<IFormValues>>

  // bucketStore 或其他数据很可能会被别人更新
  // 但是只要这里需要消费的 maxAge 最终没有变化，那么就可以认为没影响（因此利用了 computed 的特性）
  // 反之，这里就需要考虑应该如何处理
  @computed get sourceMaxAge() {
    const bucket = this.bucketStore.getDetailsByName(this.props.bucketName)
    return bucket && bucket.max_age
  }

  // 依赖数据收集，主要用于监听上下文环境变化
  // 通常包括 props 里 default*** 性质的东西 和 真的需要被 reaction 的东西
  // 以及 props 传进来的 store 和 全局 import 进来或注入进来的 store 里的东西
  // 甚至包括本地初始化用的一些数据和本地 store，以及 react provider / context 里的一些东西
  // 变化检测简单地用 computed 收集、struct 实现，能相对通用地覆盖稍微复杂一点的常见场景
  // 目前恰好只有 maxAge 一个数据源，所以作用不明显（bucketName 实际上是不变的）
  @computed.struct get dataSource() {
    return {
      bucketName: this.props.bucketName,
      maxAge: this.sourceMaxAge
    }
  }

  // TODO: check: req.then 的异常也要 catch 但是好像后来大家都忘了。。。。
  @Toaster.handle()
  @Loadings.handle(Loading.GetMaxAge)
  fetchMaxAge() {
    // 这里不直接用 getMaxAge 更多地是为了演示，否则就体现不出数据源来自于全局 store 的关系了
    // 还会产生不必要的冗余，当然也有考虑是否应该提供 getMaxAge 方法的原因在里面
    return this.bucketStore.fetchDetailsByName(this.props.bucketName).then(bucket => bucket.max_age)
  }

  @Loadings.handle(Loading.SetMaxAge)
  saveRemoteMaxAge(maxAge: number) {
    return this.maxAgeApis.setMaxAge(this.props.bucketName, maxAge)
  }

  @autobind
  handleMaxAgeBlur() {
    if (!this.formState.$.maxAge.value) this.formState.$.maxAge.reset(31536000)
  }

  // TODO: check: 这里的异常捕获好像也有很多人忘了。。。。如果 toaster 不在这一层
  @autobind
  @Toaster.handle('保存成功') // TODO: check: 离开后保存成功是小概率事件并且时间间隔很短，因此可以不详细描述事件源。。？
  async handleSubmit() {
    const validation = await this.formState.validate()

    if (validation.hasError || this.isDisposed) { // validate 也需要时间
      throw null // TODO: check: 很多人这里直接 return 变成成功 toaster 了
    }

    const { maxAge } = getValuesFromFormState(this.formState)
    try {
      return this.saveRemoteMaxAge(maxAge as number) // TODO: InputNumber 类型明显不对 @huangbinjie
    } catch (err) {
      // 如果请求结束前控件卸载了，那么成功依然必须提示，而失败就可以忽略了
      throw (this.isDisposed ? null : err)
    }
  }

  @action
  init() {
    // TODO: disposable 居然没有这个信息……
    this.disposable.addDisposer(action(() => {
      this.isDisposed = true
    }))

    // 目前假定 dataSource 跟别的业务是正交的，只有这里消费（读 + 写），而且用户也不会有多端、耗时、并发操作
    // 所以暂时不做处理，初始化后后续也不会 reaction / watch 它（所以用 when），也不会主动从远端重新更新时效性更高的数据
    // 整个空间设置的各块基本上都能这么假定，这是空间设置的整体设计基石
    // 甚至是整个空间管理的各个页面 + bucket 全局 store 的设计基石
    // 实质上强耦合于后端的业务实现或者说目前的业务现实了
    // 一个东西如果过多地依赖于开发人员对业务的理解深度、特别是前端对后端业务模型的理解
    // 这个假设本身是不太牢固、并且不太现实的，长远来说很难保证
    // 特别是当业务模型 / 后端接口设计发生变，或者人员流动
    // 我们本质上是无法应对这种变化的，而我们目前的设计加剧了这方面的风险，耦合度还是过高了
    // 之所以用 reaction 而不是 fetch.then 的回调里处理
    // 是因为依赖数据往往不止一个、fetch 也不止一个，所以这么处理比较通用，这里恰好一个而已
    this.disposable.addDisposer(when(
      // 检测所有依赖是否已 ready
      () => {
        const { maxAge, bucketName } = this.dataSource
        return maxAge != null && bucketName != null // TODO: 验证 maxAge
      },
      // ready 之后开始真正的初始化
      () => {
        // 一旦初始化完成，就假定不应该变，这里只是做意外检测
        this.disposable.addDisposer(reaction(
          // 其实 dirty 的判断依据不是数据源变化，而是跟当前局部状态不一致
          // 这里更多的只是起到演示作用罢了
          () => this.dataSource,
          () => { this.isDirty = true }
        ))

        const { maxAge } = this.dataSource
        this.formState = createFormState({ maxAge })

        this.isReady = true
      }
    ))

    // 由于用户的表单临时数据（不但是当前模块，还包括了空间设置页的其他模块）可能还没有保存，因此不能贸贸然刷新
    // 但是暂时也不会为此做 UI 反馈
    // 另外不直接实现在上面，而是抽象一个 dirty 出来，
    // 是因为 dirty 更通用，跟上面的概念不是一一对应的，内涵更丰富，并且使用的地方很可能不止一处
    this.disposable.addDisposer(reaction(
      () => this.isDirty,
      // eslint-disable-next-line no-console
      isDirty => isDirty && console.warn('空间设置的文件缓存模块数据已发生变更，请刷新页面，否则点击保存可能会意外覆盖掉当前最新值')
    ))

    // TODO：目前这样各自去 fetch 的话，是有风险的，哪怕 fetchByName 已经有并发控制（而不是 cache 优化）
    // 1、对内，依赖 / 耦合 于 component 的 加载顺序 / 生命周期 / 组织嵌套关系 等等
    // 如果当前控件加载完成前，别的控件率先 fetch bucket 并且请求很快完成了
    // 那么依然可能会重复发请求，不但可能降低性能和一致性
    // 如果别的控件无法正确实现对 bucketStore 的 reaction，那么就会引起预料之外的副作用，甚至可能有 bug
    // 这对每个 card 的实现者 / 维护者来说，要求稍微有点高
    // 2、反过来，别人 fetch store 的时候，也可能会影响到这里
    // 因此对当前 card 的实现也提出了同样高的要求
    // 3、自己 fetch bucket store 跟别人 fetch 是不一样的，不同情况也许需要不同处理
    // 这里的前提是 reaction 变化的时候能够知道事件源
    // 4、进一步地，如果自己跟别人相对“同时”地发起了这个请求，应该如何处理？
    // 按照目前的实现，哪怕事件源分开了，请求却只有一个，应如何看待？
    // 5、在 Layout 这一层统一 fetch 而不是各自 fetch 能够一定程度上降低复杂性、降低出 bug 几率
    // 但是问题本身的复杂度是一样的
    // 6、目前只保证到了基本的正确性（希望做到了，纯靠 review + qa），其实基本够用了（希望如此）
    // 但是从以前的 kodo admin 和 最近重构的 kodo portal 的代码质量上看，不太乐观
    // 7、mobx 全局 store 和 局部数据跟状体 和 远端数据 和 不同 react component 渲染的生命周期的相互关系、相互耦合
    // 才是整个问题的本质
    // 在 react 异步分片渲染、mobx 作者弃坑的大趋势下
    // 未来这套体系能否支撑更复杂的前端 app 开发、对开发者的素质的要求要到什么地步、有没有什么模板或套路、这些假定是否成立等等
    // 都是未来不可回避的问题
    this.fetchMaxAge().then(
      _maxAge => {
        // 防止出错（这种内部副作用一般不扩散，所以其实还好，一直这么瞎搞也没出过什么事）
        // 如果 fetch 的 cancel / abort 相关东西 ready 了，那么就不需要这个、可以直接对接 disposable 了
        if (this.isDisposed) {
          // eslint-disable-next-line no-useless-return
          return
        }

        // 一般这种情况下 maxAge 都是在此时需要存起来或者直接初始化用掉的，如放进 dataSource 里
        // 但是由于 maxAge 恰好是全局 bucket store 提供的
        // 所以这里实际上啥都不需要干，这里更多地是起到一个演示的作用
      }
    )
  }

  // TODO: 年月日时分秒优化
  @computed
  get mainView() {
    if (!this.isReady) {
      return (<Spin />)
    }

    const formFields = this.formState.$

    return (
      <Form
        className={styles.main}
        onSubmit={e => {
          e.preventDefault()
          this.handleSubmit()
        }}
      >
        <Form.Item {...bindFormItem(formFields.maxAge)} className={styles.content}>
          <Auth
            notProtectedUser
            render={disabled => (
              <InputNumber
                onBlur={this.handleMaxAgeBlur}
                {...bindInputNumberField(formFields.maxAge)}
                disabled={disabled}
                className={styles.input}
              />
            )}
          /> 秒
        </Form.Item>
        <Form.Item>
          <SettingCardFooter
            isSubmitting={this.loadings.isLoading(Loading.SetMaxAge)}
            submitBtnSensorsHook="文件客户端缓存 maxAge"
          />
        </Form.Item>
      </Form>
    )
  }

  render() {
    return (
      <SettingCard
        title="文件客户端缓存 maxAge"
        tooltip="通过配置 maxAge 实现在规定的时效内使客户端缓存更新的效果。"
        doc="maxAge"
        className={styles.cardHeight}
      >
        {this.mainView}
      </SettingCard>
    )
  }
}

export default function SettingMaxAge(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSettingMaxAge {...props} inject={inject} />
    )} />
  )
}
