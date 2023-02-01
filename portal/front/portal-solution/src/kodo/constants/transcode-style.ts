/**
 * @file common constants of transcode-style
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

/* tslint:disable: max-line-length */
export const transcodeCommand = {
  'audio-AAC-128K': 'avthumb/mp4/ab/128k/ar/44100/acodec/libfaac',
  'audio-AAC-256K': 'avthumb/mp4/ab/256k/ar/44100/acodec/libfaac',
  'audio-AAC-64K': 'avthumb/mp4/ab/64k/ar/44100/acodec/libfaac',
  'audio-HLS-32k': 'avthumb/m3u8/segtime/10/ab/32k/ar/44100/acodec/libfaac',
  'audio-HLS-48k': 'avthumb/m3u8/segtime/10/ab/48k/ar/44100/acodec/libfaac',
  'audio-HLS-64k': 'avthumb/m3u8/segtime/10/ab/64k/ar/44100/acodec/libfaac',
  'audio-MP3-128K': 'avthumb/mp3/ab/128k/ar/44100/acodec/libmp3lame',
  'audio-MP3-160K': 'avthumb/mp3/ab/160k/ar/44100/acodec/libmp3lame',
  'audio-MP3-192K': 'avthumb/mp3/ab/192k/ar/44100/acodec/libmp3lame',
  'audio-MP3-320K': 'avthumb/mp3/ab/320k/ar/44100/acodec/libmp3lame',
  'video-Generic-1080P': 'avthumb/mp4/ab/160k/ar/44100/acodec/libfaac/r/30/vb/5400k/vcodec/libx264/s/1920x1080/autoscale/1/strpmeta/0',
  'video-Generic-320x240': 'avthumb/mp4/ab/128k/ar/22050/acodec/libfaac/r/30/vb/300k/vcodec/libx264/s/320x240/autoscale/1/stripmeta/0',
  'video-Generic-360p-16:9': 'avthumb/mp4/ab/128k/ar/44100/acodec/libfaac/r/30/vb/720k/vcodec/libx264/s/640x360/autoscale/1/stripmeta/0',
  'video-Generic-360p-4:3': 'avthumb/mp4/ab/128k/ar/44100/acodec/libfaac/r/30/vb/600k/vcodec/libx264/s/480x360/autoscale/1/stripmeta/0',
  'video-Generic-480P-16:9': 'avthumb/mp4/ab/128k/ar/44100/acodec/libfaac/r/30/vb/1200k/vcodec/libx264/s/854x480/autoscale/1/stripmeta/0',
  'video-Generic-480P-4:3': 'avthumb/mp4/ab/128k/ar/44100/acodec/libfaac/r/30/vb/900k/vcodec/libx264/s/640x480/autoscale/1/stripmeta/0',
  'video-Generic-720P': 'avthumb/mp4/ab/160k/ar/44100/acodec/libfaac/r/30/vb/2400k/vcodec/libx264/s/1280x720/autoscale/1/stripmeta/0',
  'video-HLS-1000k': 'avthumb/m3u8/segtime/10/ab/128k/ar/44100/acodec/libfaac/r/30/vb/1000k/vcodec/libx264/stripmeta/0',
  'video-HLS-150k': 'avthumb/m3u8/segtime/10/ab/128k/ar/44100/acodec/libfaac/r/30/vb/150k/vcodec/libx264/stripmeta/0',
  'video-HLS-240k': 'avthumb/m3u8/segtime/10/ab/128k/ar/44100/acodec/libfaac/r/30/vb/240k/vcodec/libx264/stripmeta/0',
  'video-HLS-640k': 'avthumb/m3u8/segtime/10/ab/128k/ar/44100/acodec/libfaac/r/30/vb/640k/vcodec/libx264/stripmeta/0',
  'video-Web': 'avthumb/mp4/ab/160k/ar/44100/acodec/libfaac/r/30/vb/2200k/vcodec/libx264/s/1280x720/autoscale/1/stripmeta/0',
  'video-iPhone4': 'avthumb/mp4/ab/160k/ar/48000/acodec/libfaac/r/30/vb/2200k/vcodec/libx264/s/1280x720/autoscale/1/stripmeta/0',
  'video-iPhone4s': 'avthumb/mp4/ab/160k/ar/48000/acodec/libfaac/r/30/vb/5000k/vcodec/libx264/s/1920x1080/autoscale/1/stripmeta/0'
}

export const magicWords = ['bucket', 'key', 'etag', 'fsize', 'mimeType', 'endUser', 'fname', 'fprefix', 'ext', 'keybase']

export const custom = '自定义'
