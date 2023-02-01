import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import Tabs from 'react-icecream/lib/tabs'
import { RouterStore } from 'portal-base/common/router'
import { useInjection } from 'qn-fe-core/di'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'

export interface Props {
  links: Array<{ path: string, name: string }>
  params?: {
    domain: string
  }
}

interface PropsWithDeps extends Props {
  routerStore: RouterStore
}

@observer
class StatisticsMenuInner extends React.Component<PropsWithDeps> {
  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)
  }

  @computed get linkItems() {
    return this.props.links.map(({ path, name }) => (
      <Tabs.TabPane key={path} tab={name} />
    ))
  }

  @autobind handleMenuSelect(key: string) {
    const toUrl = this.props.params ? formatURL(key, this.props.params) : key
    this.props.routerStore.push(toUrl)
  }

  render() {
    return (
      <Tabs
        className="statistics-menu"
        animated={false}
        activeKey={this.props.routerStore.location!.pathname}
        onChange={this.handleMenuSelect}
      >
        {this.linkItems}
      </Tabs>
    )
  }
}

export default function StatisticsMenu(props: Props) {
  const routerStore = useInjection(RouterStore)

  return (
    <StatisticsMenuInner routerStore={routerStore} {...props} />
  )
}
