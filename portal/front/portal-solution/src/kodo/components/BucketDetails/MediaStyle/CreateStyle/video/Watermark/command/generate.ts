/**
 * @description generate video watermark command code
 * @author duli <duli@qiniu.com>
 */

import { encodeUrlSafeBase64 } from 'kodo/transforms/base64'
import { WatermarkMode } from '../../../common/constants'
import { TimelineType } from '../Watermark/WatermarkFormCard/Timeline'
import { RatioType } from '../Watermark/WatermarkFormCard'

import { commonCommandNameMap, endPosSymbol, picCommandNameMap, wordsCommandNameMap } from './parse'
import { CommandParseResult } from '.'

export function generate(data: CommandParseResult) {
  const { watermarkForm } = data

  const commands = watermarkForm.map(item => {
    const forwardPos = item.startHours! * 3600 + item.startMinutes! * 60 + item.startSeconds!

    const reversePos = endPosSymbol

    const timelineEnabled = item.timelineType !== TimelineType.Same

    const reverseTimelineEnabled = item.timelineType === TimelineType.Reverse

    const posCommand = timelineEnabled
      ? `${commonCommandNameMap.wmPos}/${reverseTimelineEnabled ? reversePos : forwardPos}`
      : null

    const common = [
      `${commonCommandNameMap.wmOffsetX}/${item.horizontal}`,
      `${commonCommandNameMap.wmOffsetY}/${item.vertical}`,
      posCommand,
      timelineEnabled ? `${commonCommandNameMap.wmDuration}/${reverseTimelineEnabled ? '-' + item.duration : item.duration}` : null,
      timelineEnabled ? `${commonCommandNameMap.wmShortest}/${+item.shortest!}` : null
    ]

    const wordsOrPic = item.mode === WatermarkMode.Word
      ? [
        `${wordsCommandNameMap.wmText}/${encodeUrlSafeBase64(item.words!)}`,
        `${wordsCommandNameMap.wmGravityText}/${item.origin}`,
        `${wordsCommandNameMap.wmFont}/${encodeUrlSafeBase64(item.fontFamily!)}`,
        `${wordsCommandNameMap.wmFontColor}/${encodeUrlSafeBase64(item.fontColor!)}`,
        `${wordsCommandNameMap.wmFontSize}/${item.fontSize}` // 虽然 fontSize 肯定会存在
      ]
      : [
        `${picCommandNameMap.wmImage}/${encodeUrlSafeBase64(item.url!)}`,
        `${picCommandNameMap.wmGravity}/${item.origin}`,
        item.ratioType === RatioType.Adaptive ? `${picCommandNameMap.wmScale}/${item.ratio}` : null,
        `${picCommandNameMap.wmIgnoreLoop}/${+(item.ignoreLoop || 0)}`
      ]

    return [...wordsOrPic, ...common].filter(Boolean).join('/')
  }).join('/')

  return commands
}
