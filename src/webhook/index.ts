import axios from 'axios'
import { ProjectWithState } from 'src/types'
import wecom from './wecom'

export type Data = {
  stage: 'start' | 'end' | 'err'
  repository: string
  branch: string
  compare: string
  commits: string[]
  projects?: ProjectWithState[]
}

export default function notice(url: string | undefined, data: Data) {
  if (!url) return
  // 企业微信格式
  if (url.startsWith('https://qyapi.weixin.qq.com/cgi-bin/webhook/send'))
    wecom(url, data)
  // 自定义格式
  else axios.post(url, data)
}
