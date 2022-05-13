import axios from 'axios'
import { Project } from 'src/types'
import wecom from './wecom'

export type TaskState = {
  state: 'pending' | 'fulfilled' | 'rejected'
  error?: object
  task: {
    sender: string
    repository: string
    branch: string
    compare: string
  }
  commits?: string[]
  projects?: Project[]
}

const instance = axios.create()
// toast 40x 50x
instance.interceptors.response.use(undefined, (error) => {
  if (!axios.isCancel(error)) console.log(error.message, error)
  return Promise.reject(error)
})

export default function notice(url: string | undefined, data: TaskState) {
  // 未配置webhook, 就将通知打印在日志里
  if (!url) return console.log(data)
  // 企业微信格式
  if (url.startsWith('https://qyapi.weixin.qq.com')) return wecom(url, data)
  // 自定义格式
  return axios.post(url, data).catch((err) => {
    console.log(`${url}通知失敗: ${JSON.stringify(err)}`)
  })
}
