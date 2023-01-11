/**
 * @file 提供魔法变量上下文
 */
import React, { createContext, PropsWithChildren, useContext } from 'react'

const innerContext = createContext({})

type Props = {
  vars: Record<string, any>
}

// TODO 考虑 merge 上层的 context
export default function MagicVarsProvider({ vars, children }: PropsWithChildren<Props>) {
  return <innerContext.Provider value={vars}>{children}</innerContext.Provider>
}

/** 传入需要被替换的字符串，此 hook 会自动用上下文提供的变量代替需要被替换的部分 */
export function useReplacement(text: string) {
  const vars = useContext(innerContext)
  // 每次生成一个，防止连续碰到相同的字符串匹配不上
  const reg = new RegExp('{[^{^}]*}', 'g')
  const matchedStrs: string[] = []

  let result = reg.exec(text)

  while (result != null) {
    const matchedStr = result[0]
    matchedStrs.push(matchedStr)
    result = reg.exec(text)
  }

  matchedStrs.forEach(item => {
    const matchedVar = item.replace('{', '').replace('}', '')
    if (vars[matchedVar] == null) {
      // eslint-disable-next-line no-console
      console.error('未找到变量：', matchedVar)
    } else if (vars[matchedVar] === '') {
      // eslint-disable-next-line no-console
      console.error('变量为空：', matchedVar)
    } else {
      text = text.replace(item, vars[matchedVar])
    }
  })

  return text
}
