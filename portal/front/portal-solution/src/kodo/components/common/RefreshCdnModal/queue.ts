/**
 * @author yinxulai <yinxulai@qiniu.com>
 */

import React from 'react'

type QueueState = 'done' | 'working' | 'ready'
export type TaskState = 'success' | 'failure' | 'processing' | 'ready'

export interface Task {
  run(): Promise<void>
  taskState?: TaskState
  taskError?: string
}

interface UseQueue<T extends Task> {
  list: T[]
  onDone: (tasks: T[]) => void
}

export function useQueue<T extends Task>(options: UseQueue<T>) {
  const ticket = React.useRef(3)
  const workingIndex = React.useRef(0)
  const workingRef = React.useRef(false)
  const [tasks, setTasks] = React.useState<T[]>(options.list)
  const [state, setState] = React.useState<QueueState>('ready')

  const worker = React.useCallback((taskList: T[], done: (d: T[]) => void) => {
    if (ticket.current === 0) return

    // 开始处理任务
    if (!workingRef.current) {
      workingRef.current = true
      const concurrency = ticket.current
      for (let index = 0; index < concurrency; index++) {
        worker(taskList, done) // 启动并发数量的任务
      }

      return
    }

    // 任务处理结束
    if (workingIndex.current >= taskList.length) {
      if (ticket.current === 3) { // 票都还回来了，说明任务都执行完了
        workingRef.current = false
        setState('done')
        done(taskList)
      }
      return
    }

    // 任务处于非准备中的状态，跳转到下一个任务
    const currentTask = taskList[workingIndex.current]
    if (['processing', 'success'].includes(currentTask.taskState || 'ready')) {
      workingIndex.current += 1
      worker(taskList, done)
      return
    }

    // 执行任务
    setState('working')
    ticket.current -= 1
    workingIndex.current += 1
    currentTask.taskState = 'processing'
    setTasks(taskList.slice()) // 更新状态信息
    currentTask.run().then(
      () => {
        ticket.current += 1
        currentTask.taskState = 'success'
        setTasks(taskList.slice()) // 更新状态信息
        worker(taskList, done) // 继续处理后面的任务
      },
      error => {
        ticket.current += 1
        currentTask.taskState = 'failure'
        if (typeof error === 'string' && error !== '') {
          currentTask.taskError = error
        }

        setTasks(taskList.slice()) // 更新状态信息
        worker(taskList, done) // 继续处理后面的任务
      }
    )
  }, [])

  const start = React.useCallback(() => {
    setState('ready')
    workingIndex.current = 0
    worker(tasks, options.onDone)
  }, [options.onDone, tasks, worker])

  const retry = React.useCallback(() => {
    if (state !== 'done') return
    setTasks(items => items.map(i => {
      if (i.taskState === 'success') return i
      return { ...i, taskState: 'ready' }
    }))

    start()
  }, [start, state])

  React.useEffect(() => {
    if (workingRef.current) return
    setTasks(options.list)
    setState('ready')
  }, [options.list])

  return { start, retry, tasks, state }
}
