/**
 * @author: corol
 * @github: github.com/huangbinjie
 * @created: Thu Aug 01 2019
 * @file: 用来触发 Form enter 提交的组件
 *
 * Copyright (c) 2019 Qiniu
 */

import * as React from 'react'

export default function FormTrigger() {
  // https://stackoverflow.com/questions/477691/submitting-a-form-by-pressing-enter-without-a-submit-button
  return <input type="submit" style={{ position: 'absolute', left: '-9999px' }} />
}
