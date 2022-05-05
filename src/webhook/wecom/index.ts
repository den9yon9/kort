import axios from 'axios'
import { Data } from '..'
import * as Markdown from './markdown'

const { bold, comment, correct, list, quote, star, stringify, warning, wrong } =
  Markdown

export default function wecom(url, data: Data) {
  return markdown(
    url,
    list([
      bold(
        Markdown[
          { 开始处理: 'info', 发布成功: 'info', 出错了: 'warning' }[data.title]
        ](data.title)
      ),
      data.desc ? comment(data.desc) : '',
      list(
        Object.entries(data.detail)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) =>
            quote(
              `${comment(stringify(key))}: ${
                value instanceof Array
                  ? list(
                      value.map((item) => {
                        if (item instanceof Object) {
                          if (item.state === 'pending') {
                            return star(item.path)
                          } else if (item.state === 'rejected') {
                            return list([
                              wrong(item.path),
                              warning(item.reason)
                            ])
                          } else if (item.state === 'fulfilled') {
                            return correct(item.path)
                          } else return ''
                        } else return star(stringify(item))
                      })
                    )
                  : stringify(value)
              }`
            )
          )
      )
    ])
  )
}

async function markdown(url: string, content: string) {
  // markdown.content内容不能超过4096, 否则会通知失败
  const contentShorted =
    content.length >= 4096 ? content.substring(0, 4096) : content

  return axios
    .post(url, {
      msgtype: 'markdown',
      markdown: { content: contentShorted }
    })
    .catch((err) => {
      console.log(`企業微信通知失敗: ${JSON.stringify(err)}`)
    })
    .then((response) => {
      if (response?.data.errcode !== 0)
        console.log(`企業微信通知錯誤: ${JSON.stringify(response?.data)}`)
    })
}
