/*
 * @file apm analysis page
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import { LineChart } from 'react-icecream-charts'
import { observer } from 'mobx-react'

import Modal from 'react-icecream/lib/modal'
import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import Button from 'react-icecream/lib/button'
import Spin from 'react-icecream/lib/spin'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import { Featured } from 'portal-base/user/feature-config'
import { useLocalStore } from 'portal-base/common/utils/store'

import LocalStore, { IApmUsageProps } from './store'

import './style.less'

export default observer(function Analysis(props: IApmUsageProps) {
  const store = useLocalStore(LocalStore, props)
  const { errorMsgModalOptions } = store

  return (
    <>
      <div className="apm-content-wrapper">
        <Spin spinning={store.isLoadingTimeline}>
          <Row gutter={20} justify="space-between" align="top" className="display-control">
            <Col span={6}>
              <span className="title">响应时间统计</span>
              <Tooltip title="响应时间统计：服务器（包括 Web 服务器）收到请求的时间到服务器返回响应的时间，单位毫秒（ms）。" overlayClassName="info-tip">
                <Icon type="info-circle" className="info-icon" />
              </Tooltip>
            </Col>
            <Col span={4} offset={14}>
              <Featured feature="STAT.STAT_ALLOW_EXPORT">
                <Button
                  type="ghost"
                  disabled={store.isResponseTimeExportDisable}
                  onClick={store.exportResponseTimeData}
                >导出 csv
                </Button>
              </Featured>
            </Col>
          </Row>
          <div className="chart">
            <LineChart
              series={store.responseTimeSeriesData}
              chartOptions={store.responseTimeChartOptions}
            />
          </div>
        </Spin>
        <Spin spinning={store.isLoadingTimeline}>
          <Row gutter={20} justify="space-between" align="top" className="display-control">
            <Col span={6}>
              <span className="title">下载速度统计</span>
              <Tooltip title="下载速度：页面总下载字节数 / 吞吐时间，单位 KB/s。" overlayClassName="info-tip">
                <Icon type="info-circle" className="info-icon" />
              </Tooltip>
            </Col>
            <Col span={4} offset={14}>
              <Featured feature="STAT.STAT_ALLOW_EXPORT">
                <Button
                  type="ghost"
                  disabled={store.isDownloadSpeedExportDisable}
                  onClick={store.exportDownloadSpeedData}
                >导出 csv
                </Button>
              </Featured>
            </Col>
          </Row>
          <div className="chart">
            <LineChart
              series={store.downloadSpeedSeriesData}
              chartOptions={store.downloadSpeedChartOptions}
            />
          </div>
        </Spin>
      </div>
      <Modal
        title={[<Icon key="first" type="info-circle" style={{ color: 'orange', marginRight: '10px' }} />, '该域名尚未覆盖']}
        footer={<Button onClick={() => store.updateErrorMsgForTicket()}>知道了</Button>}
        visible={!!errorMsgModalOptions}
        closable={false}
      >
        {errorMsgModalOptions ? errorMsgModalOptions.content : ''}
        <a href="https://support.qiniu.com/tickets/new" target="_blank" rel="noopener noreferrer">提交工单</a>
      </Modal>
    </>
  )
})
