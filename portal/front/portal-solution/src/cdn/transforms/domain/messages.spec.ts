import { OperationType } from 'cdn/constants/domain'
import { getMessageForOperationProcessing } from './messages'

describe('getMessageForOperationProcessing', () => {
  it('should work correctly', () => {
    expect(getMessageForOperationProcessing(OperationType.CreateDomain, false)).toBe('创建域名处理中，通常情况下 8-15 分钟完成，部分配置不可修改，若较长时间未配置完成，请提交工单反馈')
    expect(getMessageForOperationProcessing(OperationType.ModifyBsAuth, false)).toBe('修改回源鉴权处理中，通常情况下 8-15 分钟完成，期间域名访问不受影响，部分配置不可修改，若较长时间未配置完成，请提交工单反馈')
    expect(getMessageForOperationProcessing('operation.dont.exist', false)).toBe('operation.dont.exist操作处理中，通常情况下 8-15 分钟完成，期间域名访问不受影响，部分配置不可修改，若较长时间未配置完成，请提交工单反馈')
  })
})
