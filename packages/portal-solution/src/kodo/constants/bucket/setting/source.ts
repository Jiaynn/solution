/**
 * @file 镜像回源 (image / mirror / source)
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

export const fileName = 'robots.txt'

export enum SourceMode {
  Normal,
  Range,
  Fragment
}

export const sourceModeTextMap = {
  [SourceMode.Normal]: '普通',
  [SourceMode.Range]: 'Range 透传',
  [SourceMode.Fragment]: '分片回源'
}

export enum SourceFragmentSize {
  OneMB = 1024 * 1024,
  FourMB = 1024 * 1024 * 4
}
