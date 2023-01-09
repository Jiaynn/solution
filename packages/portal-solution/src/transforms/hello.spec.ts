import { humanize } from './hello'

it('should humanize correctly', () => {
  expect(humanize('hello')).toBe('你好')
})

it('should return original content if encountered unknown input', () => {
  expect(humanize('???!!!' as any)).toBe('???!!!')
})
