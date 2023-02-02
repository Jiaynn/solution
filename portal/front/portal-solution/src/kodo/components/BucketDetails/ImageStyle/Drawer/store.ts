/**
 * @description local store of image style
 * @author duli <duli@qiniu.com>
 */

import { debounce, isEqual, sortBy } from 'lodash'
import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'
import { injectProps } from 'qn-fe-core/local-store'
import { ToasterStore } from 'portal-base/common/toaster'

import { decodeUrlSafeBase64, encodeUrlSafeBase64 } from 'kodo/transforms/base64'

import { IDoraOptions } from 'kodo/stores/config/types'

import { joinCommands, splitCommands } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/command'

import { MediaStyle } from 'kodo/apis/bucket/image-style'
import {
  colorReg, origins, watermarkFontFamily,
  basicScaleTypeInfo, BasicScaleCategory, CropRegion, OffsetDirection,
  Origin, rawFormat, WatermarkMode, outputFormats, allCommandList, commandOrder,
  basicScaleTypes, basicScaleCategories, scaleCategory2ScaleType, EditMode, AdvancedScaleType
} from './constants'
import { createFormState, getSafeFormState, StyleProcessFormInitValue } from './Form'
import { Order } from './CropScale'

type Cmd = (typeof allCommandList)[number]

type CmdObj = {
  [cmd in Cmd]?: string[]
}

type CheckResult = {
  pass: true
} | {
  pass: false,
  msg: string
}

function getCropOffsetPrefix(origin: Origin, offsetType: string) {
  let xPrefix = ''
  let yPrefix = ''
  offsetType = offsetType.toLowerCase()
  if (origin.indexOf('West') > -1 && offsetType.indexOf('left') > -1
    || origin === 'Center' && offsetType.indexOf('left') > -1
    || origin.indexOf('East') > -1 && offsetType.indexOf('right') > -1) {
    xPrefix = '-'
  } else if (origin.indexOf('West') > -1 && offsetType.indexOf('right') > -1
    || origin === 'Center' && offsetType.indexOf('right') > -1
    || origin.indexOf('East') > -1 && offsetType.indexOf('left') > -1) {
    xPrefix = 'a'
  }
  if (origin.indexOf('North') > -1 && offsetType.indexOf('top') > -1
    || origin === 'Center' && offsetType.indexOf('top') > -1
    || origin.indexOf('South') > -1 && offsetType.indexOf('bottom') > -1) {
    yPrefix = '-'
  } else if (origin.indexOf('North') > -1 && offsetType.indexOf('bottom') > -1
    || origin === 'Center' && offsetType.indexOf('bottom') > -1
    || origin.indexOf('South') > -1 && offsetType.indexOf('top') > -1) {
    yPrefix = 'a'
  }
  return {
    x: xPrefix,
    y: yPrefix
  }
}

function getCropOffsetPos(gravity: string, sx: string, sy: string): string {
  let posX = ''
  let posY = ''
  if (gravity.indexOf('West') > -1 && sx === '-'
    || gravity === 'Center' && sx === '-'
    || gravity.indexOf('East') > -1 && sx === 'a') {
    posX = 'left'
  } else if (gravity.indexOf('West') > -1 && sx === 'a'
    || gravity === 'Center' && sx === 'a'
    || gravity.indexOf('East') > -1 && sx === '-') {
    posX = 'right'
  }

  if (gravity.indexOf('North') > -1 && sy === '-'
    || gravity === 'Center' && sy === '-'
    || gravity.indexOf('South') > -1 && sy === 'a') {
    posY = 'top'
  } else if (gravity.indexOf('North') > -1 && sy === 'a'
    || gravity === 'Center' && sy === 'a'
    || gravity.indexOf('South') > -1 && sy === '-') {
    posY = 'bottom'
  }
  return posX + '-' + posY
}

function isIntStr(str: string): boolean {
  if (Number(str) === parseInt(str, 10)) {
    return true
  }
  return false
}

function error(msg: string) {
  return {
    pass: false,
    msg
  }
}

function checkImageSlim(cmdObj: CmdObj, form: Required<StyleProcessFormInitValue>): CheckResult {
  if (cmdObj.imageslim) {
    if (cmdObj.imageslim.length > 0) {
      return error('unsupported imageslim arguments')
    }
    form.moreForm.slim = true

  } else {
    form.moreForm.slim = false
  }

  return {
    pass: true
  }
}

function checkWatermark(cmdObj: CmdObj, form: Required<StyleProcessFormInitValue>): CheckResult {
  if (cmdObj.watermark) {
    if (cmdObj.watermark[0] === '1' || cmdObj.watermark[0] === '2') {
      form.watermarkForm.mode = Number(cmdObj.watermark[0])
      for (let i = 1; i < cmdObj.watermark.length; i += 2) {
        const key = cmdObj.watermark[i]
        const value = cmdObj.watermark[i + 1]
        if (key === 'gravity') {
          if (origins.includes(value as Origin)) {
            form.watermarkForm.origin = value as Origin
          } else {
            return error('invalid watermark gravity value')
          }
        } else if (key === 'dissolve') {
          if (value !== '' && Number(value) >= 1 && Number(value) <= 100) {
            form.watermarkForm.opacity = parseInt(value, 10)
          } else if (value !== '') {
            return error('invalid watermark dissolve value')
          }
        } else if (key === 'dx' || key === 'dy') {
          const field = key === 'dx' ? 'horizontal' : 'vertical'
          if (value !== '' && Number(value) >= 1) {
            form.watermarkForm[field] = parseInt(value, 10)
          } else if (value !== '') {
            return error('invalid watermark ' + key + ' value')
          }
        } else if (cmdObj.watermark[0] === '1') {
          if (key === 'image') {
            if (value !== '') {
              form.watermarkForm.url = decodeUrlSafeBase64(value)
            } else {
              return error('watermark image url not found')
            }
          }
        } else if (cmdObj.watermark[0] === '2') {
          if (key === 'text') {
            if (value !== '') {
              form.watermarkForm.words = decodeUrlSafeBase64(value)
            } else {
              return error('watermark text content not found')
            }
          } else if (key === 'font') {
            if (value !== '') {
              const fontFamily = decodeUrlSafeBase64(value)
              if (watermarkFontFamily.includes(fontFamily)) {
                form.watermarkForm.fontFamily = fontFamily
              } else {
                return error('invalid watermark font')
              }
            }
          } else if (key === 'fontsize') {
            if (value !== '' && Number(value) >= 1 && Number(value) % 20 === 0) {
              form.watermarkForm.fontSize = parseInt(value, 10) / 20
            } else {
              return error('invalid watermark font size')
            }
          } else if (key === 'fill') {
            const color = decodeUrlSafeBase64(value)
            if (value !== '' && colorReg.test(color)) {
              form.watermarkForm.fontColor = color
            } else {
              return error('invalid watermark fill color')
            }
          } else {
            return error('unsupported watermark params')
          }
        }
      }
    } else {
      return error('unsupported watermark type')
    }
  } else {
    form.watermarkForm.mode = WatermarkMode.None
  }

  return {
    pass: true
  }
}

function checkImageView2(cmdObj: CmdObj, form: Required<StyleProcessFormInitValue>): CheckResult {
  if (cmdObj.imageView2) {
    form.advanced = false
    const mode = Number(cmdObj.imageView2[0])
    if (mode >= 0 && mode <= 5) {
      if (mode === 0 && (!cmdObj.imageView2.includes('w') || !cmdObj.imageView2.includes('h'))) {
        form.scaleForm.basicScaleCategory = BasicScaleCategory.None
      } else {
        const basicScaleType = basicScaleTypes.find(key => basicScaleTypeInfo[key].mode === mode)
        const category = basicScaleCategories.find(
          item => (scaleCategory2ScaleType[item] as unknown as string[]).includes(basicScaleType!)
        )
        form.scaleForm.basicScaleType = basicScaleType!
        form.scaleForm.basicScaleCategory = category!
      }

      for (let i = 1; i < cmdObj.imageView2.length; i += 2) {
        const key = cmdObj.imageView2[i]
        const value = cmdObj.imageView2[i + 1]

        if (key === 'w' || key === 'h') {
          if (value !== '' && isIntStr(value)) {
            form.scaleForm[key === 'w' ? 'width' : 'height'] = Number(value)
          } else {
            return error('invalid imageView2 ' + key + ' value')
          }
        } else if (key === 'format') {
          if (outputFormats.includes(value)) {
            form.outputFormat = value
          } else {
            return error('unsupported imageView2 foramt value')
          }
        } else if (key === 'interlace') {
          if (value === '0' || value === '1') {
            form.moreForm.interlace = value === '1'
          } else if (value !== undefined) {
            return error('invalid imageView2 interlace value')
          }
        } else if (key === 'q') {
          const quality = Number(value)
          if (quality >= 1 && quality <= 100) {
            form.moreForm.quality = quality
          } else if (value !== undefined) {
            return error('invalid imageView2 q value')
          }
        } else {
          return error('unsupported imageView2 params')
        }
      }
    } else {
      return error('invalid imageView2 mode')
    }
  }

  return {
    pass: true
  }
}

function checkImageMogr2(cmdObj: CmdObj, form: Required<StyleProcessFormInitValue>): CheckResult {
  if (cmdObj.imageMogr2) {
    form.advanced = true
    if (cmdObj.imageMogr2.includes('auto-orient')) {
      form.moreForm.autoOrient = true
      // 移除 auto-orient 参数
      cmdObj.imageMogr2.splice(cmdObj.imageMogr2.indexOf('auto-orient'), 1)
    }
    form.scaleCropOrder = cmdObj.imageMogr2.indexOf('crop') < cmdObj.imageMogr2.indexOf('thumbnail')
      ? Order.CropFirst
      : Order.ScaleFirst
    for (let i = 0; i < cmdObj.imageMogr2.length; i += 2) {
      const key = cmdObj.imageMogr2[i]
      let value = cmdObj.imageMogr2[i + 1]

      if (key === 'thumbnail') {
        if (value.charAt(value.length - 1) === '@') { // <Area>@
          form.scaleForm.advancedScaleType = AdvancedScaleType.Pixel
          const pixels = Number(value.slice(0, -1))
          if (pixels >= 1 && pixels <= 24999999) {
            form.scaleForm.totalPixel = pixels
          } else {
            return error('invalid imageMogr2 thumbnail area value')
          }
        } else if (value.charAt(0) === '!' && value.includes('p')) {
          let scale: number
          if (value.substr(0, 2) === '!x' && value.charAt(value.length - 1) === 'p') { // !x<Scale>p
            form.scaleForm.advancedScaleType = AdvancedScaleType.HPercent
            scale = Number(value.slice(2, -1))
            form.scaleForm.heightPercent = scale
          } else if (value.charAt(0) === '!' && value.substr(-2, 2) === 'px') { // !<Scale>px
            form.scaleForm.advancedScaleType = AdvancedScaleType.WPercent
            scale = Number(value.slice(1, -2))
            form.scaleForm.widthPercent = scale
          } else if (value.charAt(0) === '!' && value.charAt(value.length - 1) === 'p') { // !<Scale>p
            form.scaleForm.advancedScaleType = AdvancedScaleType.Percent
            scale = Number(value.slice(1, -1))
            form.scaleForm.percent = scale
          } else {
            return error('invalid imageMogr2 thumbnail value')
          }
          if (scale < 1 || scale > 999) {
            return error('invalid imageMogr2 thumbnail scale value')
          }
        } else if (value.charAt(value.length - 1) === '>' || value.charAt(value.length - 1) === '<') {
          if (value.charAt(value.length - 1) === '>') { // <Width>x<Height>>
            form.scaleForm.advancedScaleType = AdvancedScaleType.WHPercentZoomOut
          } else if (value.charAt(value.length - 1) === '<') { // <Width>x<Height><
            form.scaleForm.advancedScaleType = AdvancedScaleType.WHPercentZoomIn
          }
          const str = value.slice(0, -1)
          const zoomArr = str.split('x')
          if (zoomArr.length === 2) {
            const width = Number(zoomArr[0])
            const height = Number(zoomArr[1])
            if (width >= 1 && width <= 9999 && height >= 1 && height <= 9999) {
              form.scaleForm.width = width
              form.scaleForm.height = height
            } else {
              return error('invalid imageMogr2 thumbnail width or height value')
            }
          } else {
            return error('invalid imageMogr2 thumbnail value')
          }
        } else {
          const whArr = value.split('x')
          let width = Number(whArr[0])
          let height = Number(whArr[1])
          let widthStr = whArr[0]
          let heightStr = whArr[1]
          if (whArr.length === 2) {
            if (width >= 1 && width <= 9999 && heightStr === '') { // <Width>x
              form.scaleForm.advancedScaleType = AdvancedScaleType.HAuto
              form.scaleForm.width = width
            } else if (height >= 1 && height <= 9999 && widthStr === '') { // x<Height>
              form.scaleForm.advancedScaleType = AdvancedScaleType.WAuto
              form.scaleForm.height = height
            } else if (width >= 1 && width <= 9999 && height >= 1 && height <= 9999) {
              // <Width>x<Height>
              form.scaleForm.advancedScaleType = AdvancedScaleType.WHContain
              form.scaleForm.width = width
              form.scaleForm.height = height
            } else {
              if (widthStr.charAt(0) === '!' && heightStr.charAt(heightStr.length - 1) === 'r') {
                // !<Width>x<Height>r
                form.scaleForm.advancedScaleType = AdvancedScaleType.WHCover
                widthStr = widthStr.slice(1)
                heightStr = heightStr.slice(0, -1)
              } else if (heightStr.charAt(heightStr.length - 1) === '!') { // <Width>x<Height>!
                form.scaleForm.advancedScaleType = AdvancedScaleType.WHForce
                heightStr = heightStr.slice(0, -1)
              }

              width = Number(widthStr)
              height = Number(heightStr)
              if (
                width >= 1 && width <= 9999
                && height >= 1 && height <= 9999
              ) {
                form.scaleForm.width = width
                form.scaleForm.height = height
              } else {
                return error('invalid imageMogr2 thumbnail width or height value')
              }
            }
          } else {
            return error('invalid imageMogr2 thumbnail value')
          }
        }
      } else if (key === 'gravity') {
        if (origins.includes(value as Origin)) {
          form.cropForm.origin = value as Origin
        } else {
          return error('invalid imageMogr2 gravity value')
        }
      } else if (key === 'crop') {
        form.cropForm.enable = true
        let sizeStr = value
        let offsetStr = ''
        if (value.charAt(0) === '!') { // has offset
          value = value.slice(1)
          sizeStr = value.split(/a|-/)[0]
          offsetStr = value.replace(sizeStr, '')
          if (offsetStr === '') {
            return error('invalid imageMogr2 crop value')
          }
        }

        const sizeArr = sizeStr.split('x')
        const widthStr = sizeArr[0]
        const heightStr = sizeArr[1]
        const width = Number(widthStr)
        const height = Number(heightStr)
        if (widthStr !== '' && heightStr === '' && width < 10000 && width > 0) {
          form.cropForm.region = CropRegion.Width
          form.cropForm.width = width
        } else if (widthStr === '' && heightStr !== '' && height < 10000 && height > 0) {
          form.cropForm.region = CropRegion.Height
          form.cropForm.height = height
        } else if (widthStr !== '' && heightStr !== '' && width < 10000 && width > 0 && height < 10000 && height > 0) {
          form.cropForm.region = CropRegion.All
          form.cropForm.width = width
          form.cropForm.height = height
        } else {
          return error('invalid imageMogr2 crop width or height value')
        }

        if (offsetStr !== '') {
          const offsetArr = offsetStr.split(/a|-/)
          if (offsetArr.length === 3 && offsetArr[0] === '') {
            const dx = offsetArr[1]
            const dy = offsetArr[2]
            const sx = offsetStr.split(dx)[0]
            const sy = offsetStr.split(dx)[1].split(dy).pop()
            if (
              Number(dx) > 0
              && Number(dy) > 0
              && (sx === 'a' || sx === '-')
              && (sy === 'a' || sy === '-')
            ) {
              form.cropForm.horizontalOffset = Number(dx)
              form.cropForm.verticalOffset = Number(dy)
              form.cropForm.direction = getCropOffsetPos(form.cropForm.origin!, sx, sy) as OffsetDirection
            } else {
              return error('invalid imageMogr2 crop offset value')
            }
          } else {
            return error('invalid imageMogr2 crop offset value')
          }
        }
      } else if (key === 'blur') {
        const blurArr = value.split('x')
        if (blurArr.length === 2) {
          const radius = Number(blurArr[0])
          const sigma = Number(blurArr[1])
          if (radius <= 50 && radius >= 1) {
            form.moreForm.blurRadius = radius
          } else {
            return error('invalid imageMogr2 blur radius value')
          }
          if (sigma >= 0) {
            form.moreForm.blurEnable = sigma !== 0
            if (sigma !== 0) {
              form.moreForm.blurSigma = sigma // sigma 有效值大于 0
            }
          } else {
            return error('invalid imageMogr2 blur sigma value')
          }
        } else {
          return error('invalid imageMogr2 blur value')
        }
      } else if (key === 'rotate') {
        if (Number(value) <= 360 && Number(value) >= 1) {
          form.moreForm.rotateEnable = true
          form.moreForm.rotate = Number(value)
        } else {
          return error('invalid imageMogr2 rotate value')
        }
      } else if (key === 'background') {
        const decode = decodeUrlSafeBase64(value)
        if (colorReg.test(decode)) {
          form.moreForm.rotateBackground = decode
        } else {
          return error('unsupported imageMogr2 background value')
        }
      } else if (key === 'format') {
        if (outputFormats.includes(value)) {
          form.outputFormat = value
        } else {
          return error('unsupported imageMogr2 foramt value')
        }
      } else if (key === 'interlace') {
        if (value === '0' || value === '1') {
          form.moreForm.interlace = value === '1'
        } else if (value !== undefined) {
          return error('invalid imageView2 interlace value')
        }
      } else if (key === 'quality') {
        const quality = Number(value)
        if (quality >= 1 && quality <= 100) {
          form.moreForm.quality = quality
        } else if (value !== undefined) {
          return error('invalid imageView2 quality value')
        }
      } else {
        return error('unsupported imageMogr2 params')
      }
    }
  }

  return {
    pass: true
  }
}

export function computeCode(formValue: Omit<ReturnType<typeof createFormState>['value'], 'code' | 'editMode'>) {
  const cmdList: string[] = []
  let cropCmd = ''
  let watermarkCmd = ''
  let imageslimCmd = ''

  const {
    advanced,
    scaleForm,
    cropForm,
    moreForm,
    watermarkForm,
    outputFormat,
    scaleCropOrder
  } = formValue

  // 基本处理
  if (!advanced) { // imageView2
    const format = outputFormat
    const interlace = moreForm.interlace
    const quality = moreForm.quality
    let mode = 0

    if (scaleForm.basicScaleCategory !== BasicScaleCategory.None) {
      mode = basicScaleTypeInfo[scaleForm.basicScaleType].mode
      let w: number
      let h: number

      if (scaleForm.basicScaleCategory === BasicScaleCategory.WH) {
        // wh
        w = scaleForm.width
        h = scaleForm.height
      } else {
        // ls
        w = scaleForm.long
        h = scaleForm.short
      }

      if (!w) {
        cropCmd = `imageView2/${mode}/h/${h}`
      } else if (!h) {
        cropCmd = `imageView2/${mode}/w/${w}`
      } else {
        cropCmd = `imageView2/${mode}/w/${w}/h/${h}`
      }
    } else {
      cropCmd = `imageView2/${mode}`
    }

    if (format !== rawFormat && format) {
      cropCmd += `/format/${format}`
    }
    if (interlace) {
      cropCmd += '/interlace/1'
    }
    cropCmd += `/q/${quality}`

  } else { // imageMogr2
    const autoOrient = moreForm.autoOrient
    const crop = cropForm
    cropCmd = 'imageMogr2'
    const rotate = moreForm.rotate
    const format = outputFormat
    const interlace = moreForm.interlace
    const quality = moreForm.quality

    if (autoOrient) {
      cropCmd += '/auto-orient'
    }

    let thumbnailCode = ''

    // thumbnail
    if (scaleForm.advancedScaleType !== 'none') {
      thumbnailCode += '/thumbnail'
      const type = scaleForm.advancedScaleType
      const w = scaleForm.width
      const h = scaleForm.height
      const pixels = scaleForm.totalPixel
      const wPercent = scaleForm.widthPercent
      const hPercent = scaleForm.heightPercent
      const percent = scaleForm.percent
      if (type === 'wh-contain') {
        thumbnailCode += `/${w}x${h}`
      } else if (type === 'wh-cover') {
        thumbnailCode += `/!${w}x${h}r`
      } else if (type === 'wh-force') {
        thumbnailCode += `/${w}x${h}!`
      } else if (type === 'wh-percent-zoomout') {
        thumbnailCode += `/${w}x${h}>`
      } else if (type === 'wh-percent-zoomin') {
        thumbnailCode += `/${w}x${h}<`
      } else if (type === 'pixel') {
        thumbnailCode += `/${pixels}@`
      } else if (type === 'h-auto') {
        thumbnailCode += `/${w}x`
      } else if (type === 'w-auto') {
        thumbnailCode += `/x${h}`
      } else if (type === 'percent') {
        thumbnailCode += `/!${percent}p`
      } else if (type === 'w-percent') {
        thumbnailCode += `/!${wPercent}px`
      } else if (type === 'h-percent') {
        thumbnailCode += `/!x${hPercent}p`
      }
    }

    let cropCode = ''
    // crop
    if (crop.enable) {
      const gravity = crop.origin // 原点
      const w = crop.width
      const h = crop.height
      const offsetType = crop.direction
      const x = crop.horizontalOffset
      const y = crop.verticalOffset

      cropCode += `/gravity/${gravity}/crop`
      if (offsetType === OffsetDirection.None) {
        cropCode += '/'
      } else {
        cropCode += '/!'
      }
      if (crop.region === CropRegion.Width) {
        cropCode += `${w}x`
      } else if (crop.region === CropRegion.Height) {
        cropCode += `x${h}`
      } else {
        cropCode += `${w}x${h}`
      }

      if (offsetType !== OffsetDirection.None) {
        const offsetPrefix = getCropOffsetPrefix(gravity, offsetType)
        cropCode += `${offsetPrefix.x}${x}${offsetPrefix.y}${y}`
      }
    }

    cropCmd += (scaleCropOrder === Order.ScaleFirst ? thumbnailCode + cropCode : cropCode + thumbnailCode)

    if (moreForm.rotateEnable) {
      cropCmd += `/rotate/${rotate}/background/${encodeUrlSafeBase64(moreForm.rotateBackground)}`
    }
    if (format !== rawFormat) {
      cropCmd += `/format/${format}`
    }
    if (interlace) {
      cropCmd += '/interlace/1'
    }
    const blurSigma = moreForm.blurEnable ? moreForm.blurSigma : 0 // 关闭时，blur 为 0
    cropCmd += `/blur/${moreForm.blurRadius}x${blurSigma}/quality/${quality}`
  }

  if (watermarkForm.mode !== WatermarkMode.None) {
    const dissolve = watermarkForm.opacity // 不透明度
    const gravity = watermarkForm.origin // 水印位置
    const dx = watermarkForm.horizontal // 横向
    const dy = watermarkForm.vertical // 纵向

    watermarkCmd = 'watermark'
    if (watermarkForm.mode === WatermarkMode.Picture) {
      const watermarkUrl = encodeUrlSafeBase64(watermarkForm.url)
      watermarkCmd += `/1/image/${watermarkUrl}`
    } else {
      const watermarkText = encodeUrlSafeBase64(watermarkForm.words)
      const fontFamily = encodeUrlSafeBase64(watermarkForm.fontFamily)
      const fontSize = watermarkForm.fontSize * 20
      const fontColor = encodeUrlSafeBase64(watermarkForm.fontColor)
      watermarkCmd += `/2/text/${watermarkText}/font/${fontFamily}/fontsize/${fontSize}/fill/${fontColor}`
    }
    watermarkCmd += `/dissolve/${dissolve}/gravity/${gravity}/dx/${dx}/dy/${dy}`
  }

  if (moreForm.slim) {
    imageslimCmd = 'imageslim'
  }

  if (cropCmd !== '') {
    cmdList.push(cropCmd)
  }
  if (watermarkCmd !== '') {
    cmdList.push(watermarkCmd)
  }
  if (imageslimCmd !== '') {
    cmdList.push(imageslimCmd)
  }

  return joinCommands(cmdList)
}

export function parseStyle(style: MediaStyle): StyleProcessFormInitValue | undefined {
  const result: Required<StyleProcessFormInitValue> = getSafeFormState()

  result.name = style?.name || ''

  if (!style) {
    return result
  }

  const cmdList = splitCommands(style.commands)

  const cmdObj: CmdObj = {}
  const cmdNameList: Cmd[] = []
  for (let i = 0; i < cmdList.length; i++) {
    const [cmdName, ...cmdValues] = cmdList[i].split('/')
    if (!(allCommandList as readonly string[]).includes(cmdName)) {
      throw new Error('unsupported command: ' + cmdName)
    }

    cmdNameList.push(cmdName as Cmd)
    if (cmdObj[cmdName] != null) {
      throw new Error('repeated command: ' + cmdName)
    }

    cmdObj[cmdName] = cmdValues
  }

  if (cmdNameList.includes('imageView2') && cmdNameList.includes('imageMogr2')) {
    throw new Error('imageView2 and imageMogr2 cannot appear at same time')
  }

  const sortedCmdNameList = sortBy(cmdNameList, cmd => commandOrder[cmd])
  if (!isEqual(cmdNameList, sortedCmdNameList)) {
    throw new Error('unsupported commands order')
  }

  const ensurePassedResult = (checkResult: CheckResult) => {
    if (checkResult.pass === false) throw new Error(checkResult.msg)
    return true
  }

  if (
    ensurePassedResult(checkImageSlim(cmdObj, result))
    && ensurePassedResult(checkWatermark(cmdObj, result))
    && ( // 要有一个主体命令 imageView2 或者 imageMogr2，前面已经检查过不能同时存在
      (cmdObj.imageView2 && ensurePassedResult(checkImageView2(cmdObj, result)))
      || (cmdObj.imageMogr2 && ensurePassedResult(checkImageMogr2(cmdObj, result)))
    )
  ) {
    return result
  }
}

export interface Props {
  style?: MediaStyle
  doraImageConfig?: IDoraOptions['mediaStyle']
}

@injectable()
export class LocalStore extends Store {
  constructor(
    private toasterStore: ToasterStore,
    @injectProps() { style, doraImageConfig }: Props
  ) {
    super()

    makeObservable(this)

    this.doraImageConfig = doraImageConfig
    this.createFormState(style)
  }

  @observable.ref form: ReturnType<typeof createFormState>

  @observable code = ''
  @observable canSave = false
  @observable.ref doraImageConfig: IDoraOptions['mediaStyle'] | undefined

  @action.bound
  updateCode(code?: string) {
    this.code = code || ''
  }

  @action.bound
  syncFormCodeFieldToCode() {
    this.code = this.form.$.code.value
  }

  @action.bound
  updateCanSave(canSave: boolean) {
    this.canSave = canSave
  }

  @action.bound
  createFormState(style?: MediaStyle) {
    let initVal: StyleProcessFormInitValue | undefined
    if (style) {
      initVal = this.parseStyle(style)
      if (!initVal) {
        initVal = {
          name: style.name || '',
          code: style.commands || '',
          editMode: EditMode.Manual
        }
        this.updateCode(style.commands || '')
      }
    }

    this.form = createFormState(initVal)

    this.addDisposer(
      reaction(
        // MARK: name 变动的时候会触发，可以把 name 移出来，或者在这里列举出需要观测的属性
        () => this.form.value,
        () => this.generateCode(),
        { fireImmediately: true }
      ),
      this.form.dispose
    )
  }

  generateCode = debounce(async () => {
    const validSomeFields = await this.validateSelectedFields()
    const needToComputeCode = validSomeFields && this.form.$.editMode.value !== EditMode.Manual
    const validName = !this.form.$.name.hasError && !!this.form.$.name.value

    runInAction(() => {
      if (needToComputeCode) this.updateCode(computeCode(this.form.value))
      this.updateCanSave(validSomeFields && validName)
    })
  }, 250)

  // 校验当前显示的字段是否合法
  async validateSelectedFields() {
    if (!this.form) return false

    const form = this.form.$
    const { code, editMode, scaleForm, moreForm, cropForm, watermarkForm, outputFormat } = form

    // eslint-disable-next-line no-underscore-dangle
    if (outputFormat._value === 'svg' && watermarkForm.$.mode._value !== WatermarkMode.None) {
      // FIXME: 这个提示应该在 watermarkForm 的 Form.item 上提示
      this.toasterStore.error('不支持 SVG 格式')
      return false
    }

    // 手动模式不需要重新生成 code
    // eslint-disable-next-line no-underscore-dangle
    if (editMode._value === EditMode.Manual) {
      // eslint-disable-next-line no-underscore-dangle
      return !!code._value
    }

    // name 不检测，所以不用 this.form.validate()
    await Promise.all([
      scaleForm.validate(),
      moreForm.validate(),
      cropForm.validate(),
      watermarkForm.validate()
    ])

    return !(scaleForm.hasError || moreForm.hasError || cropForm.hasError || watermarkForm.hasError)
  }

  async validateCanSave() {
    const nameField = this.form.$.name
    return await this.validateSelectedFields() && !nameField.hasError && !!nameField.value
  }

  parseStyle(style?: MediaStyle): StyleProcessFormInitValue | undefined {
    if (!style) throw new Error('解析样式失败，样式为 undefined')
    try {
      return parseStyle(style)
    } catch { /** */ }
  }
}
