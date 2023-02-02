## 前置条件

登录到 [七牛云 portal 后台](https://portal.qiniu.com/) ，在 [个人中心>密钥管理](https://portal.qiniu.com/user/key ) 中获取所需的 AccessKey/SecretKey

## aiToken

```java
// app_id 加上过期时间
src = "<app_id>:<expiration>"
encodedSrc = urlsafe_base64_encode(src)
// 计算HMAC-SHA1签名，并对签名结果做URL安全的Base64编码
sign = hmac_sha1(encodedSrc, "Your_Secret_Key")
encodedSign = urlsafe_base64_encode(sign)
// 拼接上述结果得到 token
token = "QD " + Your_Access_Key + ":" + encodedSign + ":" + encodedSrc
```
涉及到用户 SecretKey 建议签名逻辑运行在接入方服务器端，该 aiToken 的作用是 ai 除了实时语音转文字外的能力的接口认证，只需要初始化一次，中途可能过期。

#### aiToken 的 appId 创建

```shell
POST https://ap-open-z0.qiniuapi.com/dora-sdk/app Host: ap-open-z0.qiniuapi.com
Content-Type: application/json
Authorization: Qiniu Token
{
    "id": "test_app" // 响应
}
```

其中 Authorization [参考](https://developer.qiniu.com/kodo/manual/access-token)，appid 目前采用接口创建，控制台可视化创建 appId 我们正在支持

## signToken 

客户端请求语音识别开启的时候，SDK 将语音识别 url（每次开启 url 不一样）回调给接入方，接入方在自己的服务器用密钥签名。

rtc-ai SDK 中 init() 方法第二个参数（即生成 signToken 的函数）的参数为待签名的 url（**url 中已经包含了时间戳**）。

[将 url 签名成 token 参考](https://developer.qiniu.com/kodo/1202/download-token)

涉及到用户 SecretKey 建议签名逻辑运行在接入方服务器端。

