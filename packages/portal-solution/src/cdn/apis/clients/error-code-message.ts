/*
 * @file error code messages for fusion apis
 * @author nighca <nighca@live.cn>
 */

export const helpWordMessage = {
  cn: '请创建工单获取帮助',
  en: 'Please create ticket for help.'
}

export const errorCodeMsg = {
  8001: {
    cn: '域名已经存在',
    en: 'Domain name exists.'
  },
  8002: {
    cn: '域名已经被他人使用',
    en: 'Domain name is used by others.'
  },
  8003: {
    cn: '无效的域名',
    en: 'Invalid domain name.'
  },
  8004: {
    cn: '域名正在删除',
    en: 'Deleting domain name.'
  },
  8005: {
    cn: '无效的源站域名',
    en: 'Invalid origin domain name.'
  },
  8006: {
    cn: '无效的源站 Ip',
    en: 'Invalid origin IP.'
  },
  8007: {
    cn: '无效的 icp',
    en: 'Invalid icp.'
  },
  8008: {
    cn: '无效的源站类型',
    en: 'Invalid origin type.'
  },
  8009: {
    cn: '无效的国家',
    en: 'Invalid country.'
  },
  8010: {
    cn: '无效的协议',
    en: 'Invalid agreement.'
  },
  8011: {
    cn: '无效的类型',
    en: 'Invalid type.'
  },
  8012: {
    cn: '无效的线路',
    en: 'Invalid line.'
  },
  8013: {
    cn: '空间不存在',
    en: 'Bucket does not exist.'
  },
  8100: {
    cn: '域名冲突',
    en: 'Domain name conflict.'
  },
  40401: {
    cn: '获取统计数据失败',
    en: 'Failed to get stats.'
  },
  400000: {
    cn: '无效输入',
    en: 'Invalid input.'
  },
  400001: {
    cn: '无效域名',
    en: 'Invalid doman name.'
  },
  400002: {
    cn: '无效的源站类型',
    en: 'Invalid origin type.'
  },
  400003: {
    cn: '无效的线路平台',
    en: 'Invalid line platform.'
  },
  400004: {
    cn: '无效的覆盖范围',
    en: 'Invalid coverage.'
  },
  400005: {
    cn: '无效的协议',
    en: 'Invalid agreement.'
  },
  400006: {
    cn: '无效的线路Id',
    en: 'Invalid line Id.'
  },
  400007: {
    cn: '域名已经存在',
    en: 'Domain name exists.'
  },
  400008: {
    cn: '空间不存在',
    en: 'Bucket does not exist.'
  },
  400009: {
    cn: '记录不存在',
    en: 'Record does not exist.'
  },
  400010: {
    cn: '空间已存在',
    en: 'Bucket exists.'
  },
  400011: {
    cn: '空间数量超过限制',
    en: 'Bucket number exceeding limit.'
  },
  400012: {
    cn: '更新pub表失败',
    en: 'Failed to update pub sheet.'
  },
  400013: {
    cn: '重复操作',
    en: 'Duplicate operation.'
  },
  400014: {
    cn: '无效 Uid',
    en: 'Invalid Uid.'
  },
  400015: {
    cn: '无效的结果',
    en: 'Invalid resul.t'
  },
  400016: {
    cn: '无效的 TaskId',
    en: 'Invalid TaskId.'
  },
  400017: {
    cn: '无效的结果描述',
    en: 'Invalid result description.'
  },
  400018: {
    cn: '无效的 Cname',
    en: 'Invalid Cname.'
  },
  400019: {
    cn: '修改源站失败',
    en: 'Failed to modify origin.'
  },
  400020: {
    cn: '您使用的加速域名未备案，请使用已备案域名重新创建',
    en: 'The accelerated domain name you used has not been filed. Please re-create it with the filed domain name.'
  },
  400021: {
    cn: '无效的 Marker',
    en: 'Invalid Marker.'
  },
  400022: {
    cn: '无效的测试URL',
    en: 'Invalid test URL.'
  },
  400023: {
    cn: '无效的Ip',
    en: 'Invalid Ip.'
  },
  400024: {
    cn: '确认源站失败',
    en: 'Failed to confirm origin.'
  },
  400025: {
    cn: '域名冲突',
    en: 'Domain name conflict.'
  },
  400026: {
    cn: '域名已存在',
    en: 'Domain name exists'
  },
  400027: {
    cn: '测试URL已存在',
    en: 'Test URL exists'
  },
  400028: {
    cn: '该域名暂不支持修改源站',
    en: 'The domain name does not support modifying the origin.'
  },
  400029: {
    cn: '空间冲突',
    en: 'bucket conflict.'
  },
  400030: {
    cn: '域名任务处理中',
    en: 'Domain name task in progress.'
  },
  400031: {
    cn: '无效的URL',
    en: 'Invalid URL.'
  },
  400032: {
    cn: '无效的 Host',
    en: 'Invalid Host.'
  },
  400033: {
    cn: '预取 URL 限制',
    en: 'Prefetch URL restrictions.'
  },
  400034: {
    cn: '刷新域名个数超过限制，如有需求，' + helpWordMessage.cn,
    en: 'Refreshed domain names number exceeds the limit, if necessary, ' + helpWordMessage.en
  },
  400035: {
    cn: '刷新目录个数超过限制，如有需求，' + helpWordMessage.cn,
    en: 'Refreshed catalog number exceeds the limit, if necessary, ' + helpWordMessage.en
  },
  400036: {
    cn: '无效的请求Id',
    en: 'Invalid request Id'
  },
  400037: {
    cn: 'URL 已在队列中，无需重复提交',
    en: 'URL is already in the queue, no need to submit it repeatedly.'
  },
  400038: {
    cn: '目录未授权',
    en: 'Catalog not authorized.'
  },
  400039: {
    cn: '请求次数过多',
    en: 'Too many request times.'
  },
  400040: {
    cn: '无效的源站域名',
    en: 'Invalid origin domain name.'
  },
  400041: {
    cn: '无效的源站Ip',
    en: 'Invalid origin IP.'
  },
  400043: {
    cn: '无效的高级源站配置',
    en: 'Invalid advanced origin configuration.'
  },
  400045: {
    cn: 'HTTPS 证书或私钥校验失败',
    en: 'HTTPS certificate or private key verification failed.'
  },
  400049: {
    cn: '该域名在两小时内被删除过，请稍候再试',
    en: 'The domain name has been deleted within two hours. Please try again later.'
  },
  // 在前端没有开始结束时间
  400080: {
    cn: '无效的日期',
    en: 'Invalid date'
  },
  400081: {
    cn: '无效的日期',
    en: 'Invalid date'
  },
  400082: {
    cn: '无效的日期',
    en: 'Invalid date'
  },
  400083: {
    cn: '生成中日志的任务数不得超过3个',
    en: 'No more than 3 task logs in build.'
  },
  400084: {
    cn: '任务进行中',
    en: 'Mission in progress'
  },
  400059: {
    cn: '不能同时配置去指定参数回源和去所有参数回源',
    en: 'Cannot configure to specify and all parameters back to source.'
  },
  400060: {
    cn: '无效的防盗链类型',
    en: 'Invalid burglar chain type'
  },
  400061: {
    cn: '无效的防盗链值',
    en: 'Invalid anti-theft chain value'
  },
  400062: {
    cn: '域名重复',
    en: 'Domain name duplication'
  },
  400063: {
    cn: '重复创建',
    en: 'Repeat creation'
  },
  400064: {
    cn: '不是您的域名',
    en: 'Not your domain name'
  },
  400065: {
    cn: '无法切换场景',
    en: 'Cannot switch scenes'
  },
  400066: {
    cn: '创建失败',
    en: 'Create failed'
  },
  400067: {
    cn: '您使用的加速域名已在第三方 CDN 设置过，' + helpWordMessage.cn,
    en: 'The accelerated domain name you use has been set in a third-party CDN, ' + helpWordMessage.en
  },
  400068: {
    cn: '场景冲突',
    en: 'Scene conflict'
  },
  400074: {
    cn: '无效的 IP 黑白名单类型',
    en: 'Invalid IP black and white list type'
  }, // ErrInvalidIpACLType: invalid ipacl type
  400075: {
    cn: '无效的 IP 黑白名单内容',
    en: 'Invalid IP black and white list contents'
  }, // ErrInvalidIpACLValue: invalid ipacl value
  400078: {
    cn: '未备案的海外域名，含有错误的配置',
    en: 'Unfiled overseas domain name, with the wrong configuration.'
  },
  400079: {
    cn: '未知的顶级域名',
    en: 'Unknown top-level domain name'
  },
  400085: {
    cn: '无效的日期',
    en: 'Invalid date'
  },
  400091: {
    cn: '缓存参数有误',
    en: 'Cache parameter error'
  },
  400098: {
    cn: '不可以提交包含动态平台类型刷新 URL',
    en: 'Cannot commit containing dynamic platform type refresh URL.'
  },
  400102: {
    cn: '回源鉴权请求配置含有无效的参数类型',
    en: 'Return source authentication request configuration contains an invalid parameter type'
  },
  400103: {
    cn: '回源鉴权请求配置 Content-Type 无效',
    en: 'Invalid return authentication request configuration Content-Type'
  },
  400104: {
    cn: '回源鉴权请求配置 value 值无效',
    en: 'Invalid return source authentication request configuration value value'
  },
  400105: {
    cn: '回源鉴权请求配置 key 值无效',
    en: 'Invalid return authentication request configuration key value'
  },
  400106: {
    cn: '回源鉴权请求配置 key 不可重复',
    en: 'Return source authentication request configuration key not repeatable'
  },
  400201: {
    cn: '请提交证书有效期大于6个月，且剩余有效期大于30天的 HTTPS 证书',
    en: 'Please submit HTTPS certificates valid for more than 6 months and remaining for more than 30 days'
  },
  400319: {
    cn: '目前 HTTPS 证书暂不支持 ECC 证书',
    en: 'ECC certificate is currently not supported by HTTPS certificate'
  },
  400320: {
    cn: '域名已停用, 不可操作',
    en: 'Domain name is disabled, not operable'
  },
  400321: {
    cn: '您的证书还未生效，请确认您的证书生效时间，并在生效后提交',
    en: 'Your certificate is not valid yet, please confirm your certificate validation date and submit it after validation'
  },
  400322: {
    cn: '请提交证书有效期大于6个月，且剩余有效期大于30天的 HTTPS 证书',
    en: 'Please submit a HTTPS certificate valid for more than 6 months and remaining for more than 30 days'
  },
  400323: {
    cn: '您的证书有误，请重新提交',
    en: 'Your certificate is wrong, please resubmit'
  },
  400324: {
    cn: '您的证书有误，请重新提交',
    en: 'Your certificate is wrong, please resubmit'
  },
  400325: {
    cn: '您的证书有误，请重新提交',
    en: 'Your certificate is wrong, please resubmit'
  },
  400326: {
    cn: '证书与域名不匹配，请重新提交',
    en: 'The certificate does not match the domain name, please resubmit'
  },
  400327: {
    cn: '私钥错误，请重新提交',
    en: 'Private key error, please resubmit'
  },
  400328: {
    cn: '私钥错误，请重新提交',
    en: 'Private key error, please resubmit'
  },
  400329: {
    cn: '您的证书已过期，请重新提交有效期大于6个月，且剩余有效期大于30天的 HTTPS 证书',
    en: 'Your certificate has expired, please resubmit the HTTPS certificate, valid for more than 6 months, and remaining valid for more than 30 days'
  },
  403000: {
    cn: '该空间已经创建了qnssl.com的 HTTPS 域名',
    en: 'The bucket has already created a qnssl. The HTTPS domain name for the com'
  },
  403009: {
    cn: '非法域名禁止创建',
    en: 'Illegal domain names are not allowed to be created'
  },
  400303: {
    cn: '该域名绑定的存储空间不属于您，请先过户存储空间再找回域名。您也可创建工单联系我们',
    en: 'The storage bucket bound by the domain name does not belong to you. Please transfer the storage bucket before recovering the domain name. You can also create work orders to contact us'
  },
  400307: {
    cn: '该域名暂不支持时间戳防盗链，如需开通使用，请创建工单联系我们',
    en: 'The domain name temporarily does not support the timestamp anti-theft chain, if you need to use, please create a work order to contact us'
  },
  400308: {
    cn: '不能同时更改两个 KEY',
    en: 'Both KEY\'s cannot be changed simultaneously'
  },
  400318: {
    cn: '没有改动 KEY 的值',
    en: 'No value of KEY was changed'
  },
  400397: {
    cn: '检测到该域名的CNAME被多个域名使用，无法自助升级，' + helpWordMessage.cn,
    en: 'The CNAME of this domain name is detected as being used by multiple domain names and cannot be upgraded,' + helpWordMessage.en
  }, // ErrSameCname
  400400: {
    cn: '重复创建证书',
    en: 'Repeat create certificate'
  },
  400401: {
    cn: '没有找到证书',
    en: 'No certificate was found'
  },
  400402: {
    cn: '该订单未通过CA机构审核，无法提交',
    en: 'This order is not approved by the CA agency and cannot be submitted'
  },
  400403: {
    cn: '没有找到证书订单',
    en: 'No certificate order was found'
  },
  400404: {
    cn: '域名验证失败',
    en: 'Domain name authentication failed'
  },
  400407: {
    cn: '该域名无法自助升级，' + helpWordMessage.cn,
    en: 'The domain name cannot be self-upgraded,' + helpWordMessage.en
  },
  400411: {
    cn: '同一域名的免费证书申请额度已达上限',
    en: 'The number of free certificates for the same domain name has reached the maximum'
  },
  400434: {
    cn: '创建证书订单失败，' + helpWordMessage.cn,
    en: 'Failed to create a certificate order,' + helpWordMessage.en
  },
  400500: {
    cn: '域名创建数量已达上限，' + helpWordMessage.cn,
    en: 'The number of domain names created reached the upper limit,' + helpWordMessage.en
  },
  400514: {
    cn: '当前加速线路暂不支持 ECC 证书，请重新上传 RSA 证书。',
    en: 'The ECC certificate is not supported by the current acceleration line. Please re-upload the RSA certificate.'
  }, // not support ecc cert line
  400515: {
    cn: '该泛域名还含有活跃的子域名',
    en: 'The generic domain name also contains an active subdomain name'
  },
  400520: {
    cn: '回源鉴权与时间戳防盗链功能不能同时开启',
    en: 'Source authentication and time stamp anti-theft chain function cannot be opened at the same time'
  }, // ErrConflictWithTimeACL
  400521: {
    cn: '鉴权服务器地址格式错误或无法访问',
    en: 'Authentication server address malformed or unreachable'
  }, // ErrInvalidBsAuthUrl
  400522: {
    cn: '回源鉴权请求方法错误',
    en: 'Return source authentication request method error'
  }, // ErrInvalidBsAuthMethod
  400523: {
    cn: '回源鉴权参数错误',
    en: 'Wrong return source authentication parameter'
  }, // ErrInvalidBsStatusCode
  400524: {
    cn: '回源鉴权返回状态码错误',
    en: 'Return authentication returns status code error'
  }, // ErrInvalidBsTimeLimit
  400525: {
    cn: '回源鉴权超时等待时间错误',
    en: 'Return source authentication timeout wait time error'
  }, // ErrInvalidBsParameter
  400541: {
    cn: '获取账号信息失败',
    en: 'Failed to obtain the account information'
  },
  400542: {
    cn: '无效的联系人姓名',
    en: 'Invalid contact nam'
  },
  400543: {
    cn: '无效的联系人邮箱',
    en: 'Invalid contact mailbox'
  },
  400544: {
    cn: '无效的联系人手机号',
    en: 'Invalid contact phone number'
  },
  400550: {
    cn: '域名创建数量已达每日上限，' + helpWordMessage.cn,
    en: 'Daily domain creation,' + helpWordMessage.en
  },
  400722: {
    cn: '域名不允许操作，' + helpWordMessage.cn,
    en: 'Domain name is not allowed,' + helpWordMessage.en
  },
  400810: {
    cn: '创建泛子域名失败，' + helpWordMessage.cn,
    en: 'Creating a generic subdomain name failed,' + helpWordMessage.en
  }, // ErrPanDomainParentCreate
  400811: {
    cn: '修改泛域名源站失败，' + helpWordMessage.cn,
    en: 'Failed to modify the generic domain source site,' + helpWordMessage.en
  }, // ErrPanDomainParentModify
  400637: {
    cn: '回源改写规则数量达到上限，' + helpWordMessage.cn,
    en: 'The maximum number of back overwrites,' + helpWordMessage.en
  },
  400865: {
    cn: '告警回调地址不存在',
    en: 'Warning callback address does not exist'
  },
  400910: {
    cn: '域名配置没有变更',
    en: 'Domain name configuration has not changed'
  },
  400925: {
    cn: '账号域名标签数量达到上限',
    en: 'The number of account domain name tags has reached the upper limit'
  },
  400926: {
    cn: '单个域名标签数量达到上限',
    en: 'The number of individual domain name tags has reached the upper limit'
  },
  400927: {
    cn: '域名标签已存在',
    en: 'Domain name tag already exists'
  },
  400932: {
    cn: '域名所有权验证失败',
    en: 'Domain name authentication failed'
  },
  401000: {
    cn: '您的账号未完成实名认证，需先完成认证才可新增域名',
    en: 'Your account has not completed the real-name authentication, you need to complete the authentication before adding the domain name'
  },
  404001: {
    cn: '没有找到该域名',
    en: 'The domain name was not found'
  },
  404904: {
    cn: '检测到域名CNAME不一致，请修改为最新的CNAME再进行操作。',
    en: 'The domain name CNAME inconsistency is detected, please modify it to the latest CNAME for operation again.'
  }, // ErrCNameNotUsed
  404905: {
    cn: '该域名无法自助升级，' + helpWordMessage.cn,
    en: 'The domain name cannot be self-upgraded,' + helpWordMessage.en
  }, // ErrNotedDomain
  404906: {
    cn: '证书错误，请检查证书',
    en: 'Certificate error, please check the certificate'
  }, // ErrPemDecodeFailed
  404907: {
    cn: '证书解析错误， 请检查证书',
    en: 'Certificate resolution error, please check the certificate'
  }, // ErrParseCertificate
  404908: {
    cn: '域名不属于您, 无法进行操作',
    en: 'The domain name does not belong to you, cannot operate'
  }, // ErrNotOwnCert
  404910: {
    cn: '该域名无法自助升级，' + helpWordMessage.cn,
    en: 'The domain name cannot be self-upgraded,' + helpWordMessage.en
  }, // ErrSSLizeCheckCDNConfigsUnmatch
  404911: {
    cn: '无效的路径',
    en: 'Invalid path'
  },
  403023: {
    cn: '域名不属于当前帐户',
    en: 'Domain name is not in the current account'
  },
  404912: {
    cn: '无效的正则表达式',
    en: 'Invalid regular expression'
  },
  404913: {
    cn: '北美机房的存储空间，暂时不支持开启图片瘦身',
    en: 'North American machine room storage bucket, temporarily does not support to open the picture slimming'
  },
  404923: {
    cn: '私有空间暂时不支持配置HTTPS 点播平台',
    en: 'Private bucket is not currently supported for configuring the HTTPS on-demand platform'
  },
  400937: {
    cn: '尚未查看域名所有权验证信息',
    en: 'Domain name ownership verification information has not been viewed'
  },
  500000: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '服务端错误'
  500001: {
    cn: '内部错误，' + helpWordMessage.cn, // '设置回源DNS失败'
    en: 'Internal error,' + helpWordMessage.en
  },
  500002: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '插入数据失败'
  500003: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '删除失败'
  500004: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '更新失败'
  500005: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '查询失败'
  500006: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '创建DNS失败'
  500007: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '删除DNS失败'
  500008: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '创建CDN失败'
  500009: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '删除CDN失败'
  500010: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '获取域名失败'
  500011: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '更新pub表失败'
  500012: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '获取空间列表失败'
  500013: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '获取空间域名列表失败'
  500014: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '获取CNAME记录失败'
  500015: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '获取域名拥有者失败'
  500016: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '刷新失败'
  500017: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '刷新目录失败'
  500018: {
    cn: '内部错误，' + helpWordMessage.cn,
    en: 'Internal error,' + helpWordMessage.en
  }, // '预取失败'
  500104: {
    cn: '国外空间不支持创建 qnssl 域名',
    en: 'Foreign bucket does not support creating a qnssl domain name'
  },
  500105: {
    cn: '国外空间不支持创建 HTTPS 域名',
    en: 'Foreign bucket does not support creating a HTTPS domain name'
  },
  500106: {
    cn: '国外空间的泛子域名的泛域名必须也在国外空间',
    en: 'The pan-domain name of the pan-subdomain name of the foreign bucket must also be in the foreign bucket'
  },
  500107: {
    cn: '国外空间的域名不能切换到国内空间',
    en: 'Domain name of foreign bucket cannot be switched to domestic bucket'
  },
  500108: {
    cn: '只有源站在国外空间的域名才能切换到国外空间',
    en: 'Only the domain name of the source station in foreign bucket can switch to foreign bucket'
  },
  500109: {
    cn: '国外空间不支持国内和全球的域名',
    en: 'Foreign bucket does not support domestic and global domain names'
  },
  500215: {
    cn: '服务器错误，请稍后重试',
    en: 'Server error, please try again.'
  }, // ErrRetry
  500219: {
    cn: '服务器错误，请稍后重试',
    en: 'Server error, please try again.'
  }, // ErrRequestFusionSSLCertServer
  500220: {
    cn: '服务器错误，请稍后重试',
    en: 'Server error, please try again.'
  }, // ErrRequestRobotServer
  500233: {
    cn: '证书有效期不足，' + helpWordMessage.cn,
    en: 'Certificate is not valid,' + helpWordMessage.en
  },
  500923: {
    cn: '不能修改已冻结的域名',
    en: 'You cannot modify the frozen domain name'
  }, // try to operate frozen domain

  // 域名冲突临时方案
  400000000: {
    cn: '之前已被创建过',
    en: 'Created previously'
  },
  400001000: {
    cn: '该域名产生冲突，需要验证这个域名属于你',
    en: 'This domain name conflicts, you need to verify that this domain name belongs to you'
  },
  400002000: {
    cn: '没有授权的AKSK，请联系域名服务的管理员',
    en: 'Without an authorized AKSK, please contact the administrator of the domain name service'
  },
  400003000: {
    cn: '域名格式不合法',
    en: 'Domain Name Format is Illegal'
  },
  400004000: {
    cn: '非 Admin 用户',
    en: 'Non-Admin user'
  },
  400005000: {
    cn: '时间戳不合法',
    en: 'Time stamp is illegal'
  },
  400006000: {
    cn: '没有 icp 备案',
    en: 'No icp filed'
  },
  400007000: {
    cn: '域名正在被别的用户找回',
    en: 'The domain name is being recovered by another user.'
  },
  400008000: {
    cn: '找回文件内容错误',
    en: 'Found file content error.'
  },
  400009000: {
    cn: '域名找回频率达到限制',
    en: 'Domain name retrieval frequency reaches the limit.'
  },
  400010000: {
    cn: '域名不在找回队列中',
    en: 'Domain name is not in the Retrieving queue'
  },
  400011000: {
    cn: '目标域名无法自助找回，' + helpWordMessage.cn,
    en: 'Target domain name cannot be self-retrieved,' + helpWordMessage.en
  },
  400012000: {
    cn: '正在找回的域名已经被删除，请创建工单进行人工找回',
    en: 'The domain name being recovered has been deleted, please create a work order for manual retrieval'
  },
  500000000: {
    cn: '服务端错误',
    en: 'Server error'
  },
  500001000: {
    cn: '数据库相关错误',
    en: 'Database-related error'
  },

  // apm 错误处理方案
  400001001: {
    cn: '输入查询参数异常，' + helpWordMessage.cn,
    en: 'Enter query parameter exception,' + helpWordMessage.en
  },
  400002001: {
    cn: '查询域名信息查不到，' + helpWordMessage.cn,
    en: 'Query domain name information is not available,' + helpWordMessage.en
  },
  400003001: {
    cn: '域名平台不在我们配置的平台之内，' + helpWordMessage.cn,
    en: 'Domain name platform is not within the platform we configure,' + helpWordMessage.en
  },
  500000001: {
    cn: '服务内部错误，' + helpWordMessage.cn,
    en: 'Service internal error,' + helpWordMessage.en
  },
  500001001: {
    cn: '查询域名信息异常，' + helpWordMessage.cn,
    en: 'Query domain name information exception,' + helpWordMessage.en
  },
  500002001: {
    cn: '查询域名历史线路信息异常，' + helpWordMessage.cn,
    en: 'Query domain name history line information exception,' + helpWordMessage.en
  },
  500003001: {
    cn: '查询域名历史线路信息查不到，' + helpWordMessage.cn,
    en: 'Query domain name history line information is not found,' + helpWordMessage.en
  },
  500233000: {
    cn: '证书有效期不足，请联系七牛技术支持手动处理',
    en: 'Certificate is not valid, please contact Qiniu technical support for manual processing'
  }
} as const

export type ErrorCodeType = keyof typeof errorCodeMsg
