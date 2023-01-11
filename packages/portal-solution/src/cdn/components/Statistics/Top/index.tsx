import React from 'react'
import autobind from 'autobind-decorator'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import Button from 'react-icecream/lib/button'
import Table from 'react-icecream/lib/table'
import Radio, { RadioChangeEvent } from 'react-icecream/lib/radio'
import Spin from 'react-icecream/lib/spin'
import { Iamed } from 'portal-base/user/iam'
import { useLocalStore } from 'portal-base/common/utils/store'
import { I18nStore } from 'portal-base/common/i18n'

import { exportCSVFile } from 'cdn/utils/csv'

import IamInfo from 'cdn/constants/iam-info'

import StatisticsPanel from '../Panel'
import LocalStore, { IStatisticsTopProps } from './store'
import * as messages from './messages'

enum StatisticsType {
  Ip = 'ip',
  Url = 'url'
}

type PropsWithDeps = IStatisticsTopProps & {
  store: LocalStore
  iamInfo: IamInfo
  i18n: I18nStore
}

@observer
class StatisticsTopInner extends React.Component<PropsWithDeps> {
  @autobind handleDownloadStatistics(type: StatisticsType) {
    const { store } = this.props

    const columns = type === StatisticsType.Url
      ? store.topUrlTableColumns
      : store.topIpTableColumns
    const data = type === StatisticsType.Url
      ? store.topUrlData
      : store.topIpData

    const result = data.map(it => columns.reduce((acc, cur) => {
      acc[cur.title] = it[cur.dataIndex as keyof typeof it]
      return acc
    }, {} as Record<string, any>))

    if (result.length) {
      exportCSVFile(result, type)
    }
  }

  renderDownloadButton(type: StatisticsType) {
    return (
      <Button
        icon="download"
        type="ghost"
        onClick={() => this.handleDownloadStatistics(type)}
      >
        {this.props.i18n.t(messages.exportCsv)}
      </Button>
    )
  }

  render() {
    const { store, iamInfo, i18n } = this.props

    return (
      <div className="statistics-content-wrapper">
        <Iamed actions={[iamInfo.iamActions.GetTop]}>
          <Spin spinning={store.isTopUrlLoading}>
            <StatisticsPanel title="URL TOP 100">
              <Row justify="space-between" align="top" className="display-control">
                <Col span={4}>
                  <Radio.Group value={store.topType.url} onChange={(e: RadioChangeEvent) => store.updateTopType(e.target.value, 'url')}>
                    <Radio.Button value="traffic">{i18n.t(messages.flow)}</Radio.Button>
                    <Radio.Button value="reqcount">{i18n.t(messages.request)}</Radio.Button>
                  </Radio.Group>
                </Col>
                <Col span={4} offset={16}>
                  {this.renderDownloadButton(StatisticsType.Url)}
                </Col>
              </Row>
              <Table
                className="top-table"
                rowKey="key"
                columns={store.topUrlTableColumns}
                dataSource={store.topUrlData || []}
              />
            </StatisticsPanel>
          </Spin>
          <Spin spinning={store.isTopIpLoading}>
            <StatisticsPanel title="IP TOP 100">
              <Row justify="space-between" align="top" className="display-control">
                <Col span={4}>
                  <Radio.Group value={store.topType.ip} onChange={e => store.updateTopType(e.target.value, 'ip')}>
                    <Radio.Button value="traffic">{i18n.t(messages.flow)}</Radio.Button>
                    <Radio.Button value="reqcount">{i18n.t(messages.request)}</Radio.Button>
                  </Radio.Group>
                </Col>
                <Col span={4} offset={16}>
                  {this.renderDownloadButton(StatisticsType.Ip)}
                </Col>
              </Row>
              <Table
                className="top-table"
                rowKey="key"
                columns={store.topIpTableColumns}
                dataSource={store.topIpData || []}
              />
            </StatisticsPanel>
          </Spin>
        </Iamed>
      </div>
    )
  }
}

export default function StatisticsTop(props: IStatisticsTopProps) {
  const store = useLocalStore(LocalStore, props)
  const iamInfo = useInjection(IamInfo)
  const i18n = useInjection(I18nStore)

  return (
    <StatisticsTopInner store={store} {...props} i18n={i18n} iamInfo={iamInfo} />
  )
}
