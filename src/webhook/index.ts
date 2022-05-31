import axios from 'axios'
import path, { join } from 'path'
import { Project, Task } from 'src/types'
import { log } from '../utils'
import wecom from './wecom'

export type TaskState = {
  state: 'pending' | 'fulfilled' | 'rejected'
  error?: object
  task: Task
  commits?: string[]
  projects?: Project[]
}

const instance = axios.create()
// toast 40x 50x
instance.interceptors.response.use(undefined, (error) => {
  if (!axios.isCancel(error)) log(error.message, error)
  return Promise.reject(error)
})

export default function notice(url: string | undefined, taskState: TaskState) {
  const data = JSON.parse(JSON.stringify(taskState))
  data.task.origin = wipeHttpToken(data.task.origin)

  // 未配置webhook, 就将通知打印在日志里
  if (!url) return log(data)
  // 企业微信格式
  if (url.startsWith('https://qyapi.weixin.qq.com')) return wecom(url, data)
  // 自定义格式
  return axios.post(url, data).catch((err) => {
    log(`${url}通知失敗: ${JSON.stringify(err)}`)
  })
}

// 隐藏url中的token, 不要通知出去了
function wipeHttpToken(url: string) {
  if (!url.startsWith('http')) return url
  const { origin, pathname } = new URL(url)
  return origin + pathname
}
