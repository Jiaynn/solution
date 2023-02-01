/*
 * @file pattern constants
 * @author nighca <nighca@live.cn>
 */

// 目前号段比较复杂，考虑到将来很可能还会有变化，这里用宽松的限制
// 避免后续因为前端限制导致合法的手机号不能输入的问题
export const mobilePhone = /^\d{11}$/
