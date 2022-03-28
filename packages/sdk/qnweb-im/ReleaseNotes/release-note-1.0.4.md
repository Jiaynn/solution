# 1.0.4 发布

## 修复/优化

* 消息发送状态事件增加消息 id，即 sendRosterMessage 和 sendGroupMessage 返回 client_mid(客户端消息 id, 即通过时间戳生成客户端消息id)
* Websocket 禁用 polling，解决浏览器后台切换后自动重连慢问题
* 配置 babel，将 SDK ES6+ 语法转换为 ES5
* 在未取用户信息的时候返回有效的空 RosterInfo
* 支持修改群扩展信息
* 支持群成员全体禁言
