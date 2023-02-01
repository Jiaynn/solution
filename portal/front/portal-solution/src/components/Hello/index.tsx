/**
 * @file component Hello
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { computed, autorun } from 'mobx'
import { observer } from 'mobx-react'
import classNames from 'classnames'

import Store, { observeInjectable } from 'qn-fe-core/store'

import { Route, Link } from 'portal-base/common/router'
import { ToasterStore } from 'portal-base/common/toaster'
import { useLocalStore, injectProps } from 'portal-base/common/utils/store'

import HelloStore from 'stores/hello'

import './style.less'

interface HelloProps {
  test: string
}

interface NameProps {
  name: string
}

function Name({ name }: NameProps) {
  return <strong>{name}</strong>
}

@observeInjectable()
export class LocalStore extends Store {
  @computed get text() {
    return this.helloStore.text
  }

  @ToasterStore.handle('Get hello text succeeded.', 'Get hello text failed.')
  getText() {
    return this.helloStore.getTarget()
  }

  constructor(
    @injectProps() private props: HelloProps,
    private helloStore: HelloStore
  ) {
    super()
  }

  init() {
    this.getText()
    this.addDisposer(autorun(() => {
      // eslint-disable-next-line no-console
      console.log('props test:', this.props.test)
    }))
  }
}

export default observer(function Hello(props: HelloProps) {

  const store = useLocalStore(LocalStore, props)

  const className = classNames({ 'comp-hello': true })

  return (
    <div className={className}>
      <p>{store.text}</p>
      <Route
        relative
        path="/:name"
        component={({ match }) => <Name name={match!.params.name} />}
      />
      <p><Link relative to="/foo">foo</Link></p>
      <p><Link relative to="..">bar</Link></p>
    </div>
  )
})
