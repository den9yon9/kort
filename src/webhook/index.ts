import axios from 'axios'
import { Project } from 'src/types'
import wecom from '../wecom/index'

export type Data = {
  title: '开始处理' | '处理完成' | '出错了'
  desc?: string
  detail: {
    sender: string
    repository: string
    branch: string
    compare: string
    commits: string[]
    projects?: Project[]
  }
}

export default function notice(url: string | undefined, data: Data) {
  if (!url) return
  // 企业微信格式
  if (url.startsWith('https://qyapi.weixin.qq.com/cgi-bin/webhook/send'))
    return wecom(url, data)
  // 自定义格式
  return axios.post(url, data).catch((err) => {
    console.log(`${url}通知失敗: ${JSON.stringify(err)}`)
  })
}
