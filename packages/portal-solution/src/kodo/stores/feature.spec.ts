/**
 * @file Feature test
 * @author yinxulai <me@yinxulai.cn>
 */

// import { FeatureConfigStore } from './feature'

// describe('isDisabled', () => {
//   it('should work correctly', () => {
//     const featureConfig = new FeatureConfigStore()
//     featureConfig.updateData({
//       KODO: {
//         KODO_BUCKET_SETTING: null,
//         KODO_CREATE: { disable: true },
//         KODO_TRANSFER_USER: { disable: false }
//       }
//     })

//     expect(featureConfig.isDisabled('KODO')).toBe(false)
//     expect(featureConfig.isDisabled('KODO.KODO_CREATE')).toBe(true)
//     expect(featureConfig.isDisabled('KODO.KODO_TRANSFER_USER')).toBe(false)
//     expect(featureConfig.isDisabled('KODO.KODO_BUCKET_SETTING')).toBe(true)
//   })
// })

// describe('isDisabled', () => {
//   it('should work correctly', () => {
//     const featureConfig = new FeatureConfigStore()
//     featureConfig.updateData({
//       KODO: {
//         disable: true,
//         KODO_BUCKET_SETTING: null,
//         KODO_CREATE: { disable: true },
//         KODO_TRANSFER_USER: { disable: false }
//       }
//     })

//     expect(featureConfig.isDisabled('KODO')).toBe(true)
//     expect(featureConfig.isDisabled('KODO.KODO_CREATE')).toBe(true)
//     expect(featureConfig.isDisabled('KODO.KODO_TRANSFER_USER')).toBe(true)
//     expect(featureConfig.isDisabled('KODO.KODO_BUCKET_SETTING')).toBe(true)
//   })
// })

// describe('isDisabled', () => {
//   it('should work correctly', () => {
//     const featureConfig = new FeatureConfigStore()
//     featureConfig.updateData({
//       KODO: {
//         disable: false,
//         KODO_BUCKET_SETTING: null,
//         KODO_CREATE: { disable: true },
//         KODO_TRANSFER_USER: { disable: false }
//       }
//     })

//     expect(featureConfig.isDisabled('KODO')).toBe(false)
//     expect(featureConfig.isDisabled('KODO.KODO_CREATE')).toBe(true)
//     expect(featureConfig.isDisabled('KODO.KODO_TRANSFER_USER')).toBe(false)
//     expect(featureConfig.isDisabled('KODO.KODO_BUCKET_SETTING')).toBe(true)
//   })
// })

// describe('isDisabled', () => {
//   it('should work correctly', () => {
//     const featureConfig = new FeatureConfigStore()

//     expect(featureConfig.isDisabled('KODO')).toBe(false)
//     expect(featureConfig.isDisabled('KODO.KODO_CREATE')).toBe(true)
//     expect(featureConfig.isDisabled('KODO.KODO_TRANSFER_USER')).toBe(false) // 默认值导致
//     expect(featureConfig.isDisabled('KODO.KODO_BUCKET_SETTING')).toBe(true)
//   })
// })

// describe('isDisabled', () => {
//   it('should work correctly', () => {
//     const featureConfig = new FeatureConfigStore()

//     expect(featureConfig.isDisabled('TEST' as any)).toBe(false)
//     expect(featureConfig.isDisabled('TEST.TEST' as any)).toBe(true)
//   })
// })
