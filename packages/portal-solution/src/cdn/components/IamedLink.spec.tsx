import React from 'react'
import { UserInfoStore } from 'portal-base/user/account'
import { getQrn } from 'portal-base/user/iam/transforms'
import { Iamed, IamPermissionStore } from 'portal-base/user/iam'

import { RendererUtils as Renderer } from 'test'

import IamedLink from './IamedLink'

const renderer = new Renderer()
const product = 'productP'
const zone = 'zoneZ'
const uid = 999999

function Foo() {
  return (<p>foo</p>)
}

beforeAll(() => {
  const iamPermissionStore = renderer.inject(IamPermissionStore)
  const userInfoStore = renderer.inject(UserInfoStore)

  iamPermissionStore.setAvailableServices([product])
  iamPermissionStore.setActionsEffects([{
    action: 'ActionA',
    effect: 'Allow'
  }, {
    action: 'ActionB',
    effect: 'Deny'
  }])
  iamPermissionStore.setEffect({
    action: 'ActionA',
    resource: getQrn({
      product,
      zone,
      resource: 'Resource1'
    }),
    effect: 'Allow'
  })
  iamPermissionStore.setEffect({
    action: 'ActionA',
    resource: getQrn({
      product,
      zone,
      resource: 'Resource2'
    }),
    effect: 'Deny'
  })

  userInfoStore.update({
    uid,
    iam_user_info: {
      iuid: 111,
      alias: 'iam',
      root_uid: uid
    },
    is_iam_user: true,
    is_iam_root_user: false
  })
})

describe('renders correctly for actionNames or resources', () => {
  it('allow ActionA', () => {
    const tree = renderer.createWithAct(
      <Iamed product={product}>
        <IamedLink actions={['ActionA']}>
          <Foo />
        </IamedLink>
      </Iamed>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('allow ActionA + Resource1', () => {
    const tree = renderer.createWithAct(
      <Iamed product={product}>
        <IamedLink actions={['ActionA']} resources={['Resource1']}>
          <Foo />
        </IamedLink>
      </Iamed>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('deny ActionB', () => {
    const tree = renderer.createWithAct(
      <Iamed product={product}>
        <IamedLink actions={['ActionB']}>
          <Foo />
        </IamedLink>
      </Iamed>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('deny ActionA + Resource2', () => {
    const tree = renderer.createWithAct(
      <Iamed product={product}>
        <IamedLink actions={['ActionA']} resources={['Resource2']}>
          <Foo />
        </IamedLink>
      </Iamed>
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
