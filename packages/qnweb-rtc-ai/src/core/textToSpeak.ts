import { post } from '../api/_utils';

// 文字转语音声效枚举
export enum Speaker {
  Male1 = 'male1', // 男声1
  Male2 = 'male2', // 男声2
  Female3 = 'female3', // 女声3
  Male4 = 'male4', // 男声4
  Female5 = 'female5', // 女声5
  Female6 = 'female6', // 女声6
  Kefu1 = 'kefu1', // 客服1
  Girl1 = 'girl1', // 女孩1
}

// tts 音频编码格式枚举
export enum AudioEncoding {
  Wav = 'wav',
  Pcm = 'pcm',
  Mp3 = 'mp3',
}

/**
 * 文字转语音参数
 */
export interface TextToSpeakParams {
  text: string; // 需要进⾏语⾳合成的⽂本内容，最短1个字，最⻓200字
  speaker?: Speaker; // 发⾳⼈id，⽤于选择不同⻛格的⼈声，⽬前默认为kefu1， 可选的包括female3，female5，female6，male1，male2， male4，kefu1，girl1
  audio_encoding?: AudioEncoding; // 合成⾳频格式，⽬前默认为wav，可选的包括wav，pcm，mp3
  sample_rate?: number; // 合成⾳频的采样率，默认为16000，可选的包括8000，16000， 24000，48000
  volume?: number; // ⾳量⼤⼩，取值范围为0~100，默认为50
  speed?: number; // 语速，取值范围为-100~100，默认为0
}

/**
 * 文字转语音响应值
 */
export interface TextToSpeakRes {
  request_id?: string;
  response: {
    voice_id?: string;
    error_code?: number;
    err_msg?: number,
    audio?: string;
  };
}

/**
 * 文字转语音
 * @param params
 * @constructor
 */
export function textToSpeak(params: TextToSpeakParams): Promise<TextToSpeakRes> {
  return post<TextToSpeakParams, TextToSpeakRes>('/voice-tts', {
    speaker: Speaker.Kefu1,
    audio_encoding: AudioEncoding.Wav,
    sample_rate: 16000,
    volume: 50,
    speed: 0,
    ...params
  });
}
