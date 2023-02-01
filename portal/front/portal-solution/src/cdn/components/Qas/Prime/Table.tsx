import React from 'react'

import Icon from 'react-icecream/lib/icon'
import Tooltip from 'react-icecream/lib/tooltip'

import './style.less'

export default function PrimeDescTable() {
  return (
    <table className="prime-desc-table">
      <thead>
        <tr>
          <th></th>
          <th>基础版</th>
          <th>优享版</th>
          <th>旗舰版</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            可用性保障
            <Tooltip title="官方可用性标准为 99.90%">
              <Icon type="info-circle" className="info-icon" />
            </Tooltip>
          </td>
          <td>99.95%</td>
          <td>99.99%</td>
          <td>100%</td>
        </tr>
        <tr>
          <td>
            不可用时间赔偿
            <Tooltip title="官方不可用时间赔偿为 10 倍">
              <Icon type="info-circle" className="info-icon" />
            </Tooltip>
          </td>
          <td>15 倍</td>
          <td>30 倍</td>
          <td>50 倍</td>
        </tr>
        <tr>
          <td>VIP 线路资源服务</td>
          <td><Icon type="check" /></td>
          <td><Icon type="check" /></td>
          <td><Icon type="check" /></td>
        </tr>
        <tr>
          <td>重点运维监测服务</td>
          <td><Icon type="check" /></td>
          <td><Icon type="check" /></td>
          <td><Icon type="check" /></td>
        </tr>
        <tr>
          <td>质量监测报告</td>
          <td>无</td>
          <td>每月提供</td>
          <td>每周提供</td>
        </tr>
        <tr>
          <td>
            架构优化咨询
            <Tooltip title="可提交工单申请架构优化咨询，优先在七牛注册满两年的老客户及最近一年累计月消费满 2 万的客户。">
              <Icon type="info-circle" className="info-icon" />
            </Tooltip>
          </td>
          <td>无</td>
          <td>2 小时/月</td>
          <td>4 小时/月</td>
        </tr>
      </tbody>
    </table>
  )
}
