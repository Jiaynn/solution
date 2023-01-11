import { createState, getValue, transformValueForSubmit, AddFileMode } from './form'

it('createState works correctly', async () => {
  const formState = createState({
    addFileMode: AddFileMode.Specific,
    specificURLs: ['/foo']
  })

  expect(formState.$.addFileMode.$).toBe(AddFileMode.Specific)
  expect(formState.$.specificURLs.$).toBe('/foo')

  const urlWrong = await formState.validate()
  expect(urlWrong.hasError).toBe(true)
  expect(formState.error).toBe('请填写正确的 URL')

  formState.$.specificURLs.onChange('')
  const urlEmpty = await formState.validate()
  expect(urlEmpty.hasError).toBe(true)
  expect(formState.error).toBe('不可为空')

  formState.$.addFileMode.onChange(AddFileMode.Hotest)
  const notSelected = await formState.validate()
  expect(notSelected.hasError).toBe(true)
  expect(formState.error).toBe('请选择视频文件')
})

describe('transformValueForSubmit & getValue works correctly', () => {
  const domain = 'foo.com'

  it('for specific mode', () => {
    const urls = ['http://a.com', 'http://b.com']
    const formState = createState({
      addFileMode: AddFileMode.Specific,
      specificURLs: urls
    })
    const value = getValue(formState)

    expect(transformValueForSubmit(domain, value)).toEqual({
      domain,
      urls,
      cdnAutoEnable: false
    })
  })

  it('for hotest mode', () => {
    const urls = ['http://a.com', 'http://b.com', 'https://c.com']
    const formState = createState({
      addFileMode: AddFileMode.Hotest,
      hotestURLs: urls
    })
    const value = getValue(formState)

    expect(transformValueForSubmit(domain, value)).toEqual({
      domain,
      urls,
      cdnAutoEnable: false
    })
  })
})
