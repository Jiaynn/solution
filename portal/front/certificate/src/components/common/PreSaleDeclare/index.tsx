/**
 * @file: component SSL 证书售前说明
 * @author: liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'

import './style.less'

export interface IPreSaleDeclareProps {}

const PreSaleDeclare: React.FC<IPreSaleDeclareProps> = () => (
  <div className="comp-pre-sale-declare">
    <h3 className="declare-title">售前说明</h3>
    <p>1）由于证书为一次性分配商品，所有证书（包括 2 年期证书的续费证书）在完成付款七天后或证书完成颁发后不支持退款，请确认后购买。</p>
    <p>
      2）在 2 年续期证书的第二年证书颁发并完成部署后，您会接收到邮件通知。
      目前续期服务支持 CDN 的自动部署，如果您在七牛的其他产品（包括对象存储、负载均衡、视频直播、视频监控等）中使用了 2 年续期证书，请在收到邮件后手动完成部署。
    </p>
    <p>3）由于 CDN 配置原因，补全证书信息时预约部署 CDN 存在小概率失败情况，请您在证书颁发后检查实际部署情况。</p>
  </div>
)

export default PreSaleDeclare
