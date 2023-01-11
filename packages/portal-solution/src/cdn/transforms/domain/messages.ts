import { OperationType, operatingStateDescs as stateDescs } from 'cdn/constants/domain'
import { humanizeOperationType } from '.'

export function getMessageForCreateDomainFailure(operatingStateDesc: string): string | undefined {
  switch (operatingStateDesc) {
    case stateDescs.noIcp:
      return '您使用的加速域名未备案，请使用已备案域名重新创建'
    case stateDescs.conflictPlatform:
      return '场景冲突'
    case stateDescs.conflictDomain:
      return '您使用的加速域名已在第三方 CDN 设置过，请创建工单获取帮助'
    default:
  }
}

export function getMessageForSwitchFailure(operatingStateDesc: string): string | undefined {
  switch (operatingStateDesc) {
    case stateDescs.noIcp:
      return '您使用的加速域名未备案，请使用已备案域名重新创建'
    case stateDescs.conflictPlatform:
      return '场景冲突'
    case stateDescs.conflictDomain:
      return '您使用的加速域名已在第三方 CDN 设置过，请创建工单获取帮助'
    default:
  }
}

export function getMessageForModifyHttpsCertFailure(operatingStateDesc: string): string | undefined {
  if (operatingStateDesc === stateDescs.verifyHttpsCertFail) {
    return 'HTTPS 证书有误'
  }
}

export function getMessageForOperationFailure(
  operationType: OperationType,
  operatingStateDesc: string
) {
  const operationTypeText = humanizeOperationType(operationType)
  const message = `${operationTypeText}失败`
  switch (operationType) {
    case OperationType.CreateDomain:
      return getMessageForCreateDomainFailure(operatingStateDesc) || message
    case OperationType.Switch:
      return getMessageForSwitchFailure(operatingStateDesc) || message
    case OperationType.ModifyHttpsCert:
      return getMessageForModifyHttpsCertFailure(operatingStateDesc) || message
    case OperationType.DeleteDomain:
    case OperationType.ModifySource:
    case OperationType.ModifyReferer:
    case OperationType.ModifyBsAuth:
    case OperationType.ModifyCache:
    case OperationType.Record:
    case OperationType.ModifyTimeACL:
      return message
    default:
      return '内部错误'
  }
}

export function getMessageForOperationProcessing(operationType: string, freeCertProcessing: boolean) {
  const operationTypeText = humanizeOperationType(operationType)
  const prefix = `${operationTypeText}处理中`
  let extra
  if (operationType === OperationType.Sslize || freeCertProcessing) {
    // 升级 ssl 和申请免费证书中的文案一致
    extra = '免费证书申请耗时相对较长，平均 15 分钟完成，期间域名访问不受影响，部分配置不可修改，若长时间未配置完成，请提交工单反馈'
  } else if (operationType === OperationType.CreateDomain) {
    extra = '通常情况下 8-15 分钟完成，部分配置不可修改，若较长时间未配置完成，请提交工单反馈'
  } else {
    extra = '通常情况下 8-15 分钟完成，期间域名访问不受影响，部分配置不可修改，若较长时间未配置完成，请提交工单反馈'
  }
  return `${prefix}，${extra}`
}
