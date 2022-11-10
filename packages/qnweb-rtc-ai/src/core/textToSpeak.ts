import { request } from '@/api/_utils';
import { QNVoiceTtsParams, QNVoiceTtsResult } from '@/types';

export type TextToSpeakParams = QNVoiceTtsParams;
export type TextToSpeakResult = QNVoiceTtsResult;

/**
 * 文字转语音
 * @param params
 * @constructor
 */
export function textToSpeak(params: QNVoiceTtsParams) {
  return request.post<QNVoiceTtsResult, QNVoiceTtsResult>('/voice-tts-v2', {
    content: params.content,
    ...params
  });
}
