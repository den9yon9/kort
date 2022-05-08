import { Project } from 'src/types'
import { TaskState } from '../webhook'
import markdown, {
  bold,
  comment,
  info,
  correct,
  list,
  quote,
  star,
  warning,
  wrong,
  pair,
  br
} from '../wecom/markdown'

const taskTitleMap = {
  pending: info('开始处理'),
  fulfilled: info('处理完成'),
  rejected: warning('处理失败')
}

const projectMarkdorn = (project: Project) =>
  ({
    pending: () => comment(star(project.name)),
    fulfilled: () => info(correct(project.name)),
    rejected: () => list([wrong(project.name), pair(project.reason as object)])
  }[project.state]())

export default function wecom(url, data: TaskState) {
  return markdown(
    url,
    list([
      bold(taskTitleMap[data.state]),
      data.error ? pair(data.error) : '',
      pair(data.task),
      list(data.projects.map(projectMarkdorn))
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
