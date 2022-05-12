import { Project } from 'src/types'
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
  quote
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
    rejected: () => list([wrong(comment(name)), pair(reason as any)])
  }[state]())

export default function wecom(url, data: TaskState) {
  return markdown(
    url,
    list([
      bold(taskTitleMap[data.state]),
      data.error ? pair(data.error) : '',
      pair(data.task),
      bold(comment('提交记录')),
      quote(list(data.commits.map((item) => star(comment(item))))),
      bold(
        comment(
          {
            pending: '变更项目',
            fulfilled: '打包结果',
            rejected: '打包结果'
          }[data.state]
        )
      ),
      {
        pending: quote(list(data.projects.map(projectMarkdown))),
        fulfilled: list(data.projects.map(projectMarkdown)),
        rejected: list(data.projects.map(projectMarkdown))
      }[data.state]
    ])
  )
    .then((response) => {
      if (response.data.errcode === 0) return
      console.log(`企业微信通知错误: ${JSON.stringify(response.data)}: `, data)
    })
    .catch((err) => {
      console.log(`企业微信通知失败: ${err.message}}: `, data)
    })
}
