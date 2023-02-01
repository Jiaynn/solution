/**
 * @file mocked components
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import * as React from 'react'

import { ReactProps, ReactRenderResult } from '../types/react'

export function defaultReactComponent(props: ReactProps): ReactRenderResult {
  return (<>{props.children || null}</>) // children: for elements other than void elements
}

export function AntdModal(props: ReactProps): ReactRenderResult {
  return (<div className="mock-antd-modal">{props.children || null}</div>)
}

export function AntdSpin(props: ReactProps): ReactRenderResult {
  return (<div className="mock-antd-spin">{props.children || null}</div>)
}

export function AntdTag(props: ReactProps): ReactRenderResult {
  return (<div className="mock-antd-tag">{props.children || null}</div>)
}

// TODO: rc-tabs, rc-table, rc-animate

export const antdComponents = {
  Modal: AntdModal,
  Spin: AntdSpin,
  Tag: AntdTag
}

export function Highcharts(props) {
  return (<div className="mock-highcharts">{JSON.stringify(props)}</div>)
}

export function ScrollableInkTabBar(props: ReactProps): ReactRenderResult {
  return (<div className="mock-antd-scrollable-ink-tab-bar"> {props.children || null} </div>)
}
