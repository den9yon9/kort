import { Project } from 'src/types'
import { log } from '../utils'
import { TaskState } from '../webhook'
import markdown, {
  bold,
  comment,
  correct,
  list,
  star,
  warning,
  wrong,
  pair,
  success,
  quote,
  dot
} from '../wecom/markdown'

const taskTitleMap = {
  pending: success('开始处理'),
  fulfilled: success('处理完成'),
  rejected: warning('处理失败')
}

const projectMarkdown = ({ name, reason, state }: Project) =>
  ({
    pending: () => star(comment(name)),
    fulfilled: () => correct(comment(name)),
    rejected: () => list([wrong(comment(name)), quote(pair(reason as any))])
  }[state]())

export default function wecom(url, data: TaskState) {
  const { projects, commits, task, state, error } = data
  return markdown(
    url,
    list([
      bold(taskTitleMap[state]),
      quote(pair(task)),
      error && bold(comment('错误详情')),
      error && quote(pair(error)),
      commits && bold(comment('提交记录')),
      commits && quote(list(commits.map((item) => star(comment(item))))),
      projects && bold(comment(state === 'pending' ? '打包项目' : '打包结果')),
      projects && list(projects.map(projectMarkdown))
    ])
  )
    .then((response) => {
      if (response.data.errcode === 0) return
      log(`企业微信通知错误: ${JSON.stringify(response.data)}: `, data)
    })
    .catch((err) => {
      log(`企业微信通知失败: ${err.message}}: `, data)
    })
}
