import { isMP4 } from './video-slim'

it('isMP4 works correctly', () => {
  expect(isMP4('http://foo.com/path/file')).toBe(true)
  expect(isMP4('http://foo.com/path/file.mp4')).toBe(true)
  expect(isMP4('http://foo.com/path/file.MP4')).toBe(true)
  expect(isMP4('http://foo.com/path/file.bar')).toBe(false)
  expect(isMP4('http://foo.com/path/file.bar.abc')).toBe(false)
})
