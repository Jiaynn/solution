/**
 * @file QAS 详细说明 组件
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'

export default function Specification() {
  return (
    <div className="prime-specific-content">
      <ul className="specific-content-list">
        <li className="specific-content-list-item">
          <p className="specific-content-list-item-title">生效时间</p>
          <span>服务购买、取消与变更服务套餐均为次月 1 日生效；每月最后一天将锁定服务开启、关闭和变更的入口，如有变更需求可电话联系七牛售前。</span>
        </li>
        <li className="specific-content-list-item">
          <p className="specific-content-list-item-title">收费方式</p>
          <span>a、质量保障服务生效后，CDN 各项单价会在原有的基础上乘以各档比例（基础版 1.1 倍，优享版 1.2 倍，旗舰版 1.3 倍）；</span>
          <br />
          <span>b、质量保障服务生效后，选购资源包时会在对应套餐包价格基础上乘以各档比例（基础版 1.1 倍，优享版 1.2 倍，旗舰版 1.3 倍）；</span>
        </li>
        <li className="specific-content-list-item">
          <p className="specific-content-list-item-title">赔偿方式</p>
          <span>a、赔偿金额以抵价券的方式返还；</span>
          <br />
          <span>
            b、赔付上限：赔付金额不超过客户对该故障域名所消费的费用平均值（故障当月前 12 个月费用折算平均值）
            或故障当月客户消费的月度服务费的 25%（服务不满 12 个月，不包含本月）。
          </span>
        </li>
        <li className="specific-content-list-item">
          <p className="specific-content-list-item-title">服务范围</p>
          <span>a、支持客户结算方式不限，如有阶梯价格则每档乘相应比例。</span>
        </li>
        <li className="specific-content-list-item">
          <p className="specific-content-list-item-title">特殊说明</p>
          <span>a、若原来以非质量保障服务价格购买的资源包仍在使用中，请消耗之后再开启服务。否则在发生故障之后，只能按照官方 SLA 标准进行赔付。</span>
          <br />
          <span>b、质量保障服务生效期间，无法申请 CDN 价格修改。</span>
        </li>
      </ul>
    </div>
  )
}
