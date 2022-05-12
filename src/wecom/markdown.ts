import axios from 'axios'
import safeStringify from 'fast-safe-stringify'
import sizeOf from './sizeOf'

export const br = '\n'

export function color(color: string, text: string) {
  return `<font color=${color}>${text}</font>`
}

export function trim(text: string) {
  return text.trim()
}

export function quote(text: string) {
  return `> ${escape(text)}\n`
}

export function italic(text: string) {
  return `*${text}*`
}

export function bold(text: string) {
  return `**${text}**`
}

export function warning(text: string) {
  return color('warning', text)
}

export function info(text: string) {
  return color('#40a9ff', text)
}

export function success(text: string) {
  return color('info', text)
}

export function comment(text: string) {
  return color('comment', text)
}

export function error(text: string) {
  return color('red', text)
}

export function list(list: string[]) {
  return `${list.filter(Boolean).join('\n')}`
}

export function star(text: string) {
  return `${warning('✦')} ${text}`
}

export function dot(text: string) {
  return `${warning('●')} ${text}`
}

export function correct(text: string) {
  return `${color('green', `${bold('✓')} `)} ${text}`
}

export function wrong(text: string) {
  return `${color('red', `${bold('✗')} `)} ${text}`
}

export function escape(text: string) {
  return text.split('\n').filter(Boolean).join('\n')
}

export function anchor(text: string) {
  const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-|:)+)/g
  if (!reg.test(text)) return text
  return text.replace(reg, '[$1$2]($1$2)')
}

export function stringify(data: any) {
  return anchor(
    escape(trim(String(data instanceof Object ? safeStringify(data) : data)))
  )
}

export function pair(obj: object) {
  return quote(
    list(
      Object.entries(obj).map(
        ([key, value]) =>
          `${comment(stringify(key))}: ${
            value instanceof Array
              ? `${br}${list(value.map(stringify))}`
              : stringify(value)
          } `
      )
    )
  )
}

export function title(text: string) {
  return bold(comment(`--${text}--`))
}

export default async function markdown(url: string, content: string) {
  // markdown.content内容不能超过4096, 否则会通知失败
  const contentShorted =
    sizeOf(content) >= 4096 ? `${content.substring(0, 3800)}...` : content

  if (sizeOf(content) >= 4096) console.log(content)

  return axios.post(url, {
    msgtype: 'markdown',
    markdown: { content: contentShorted }
  })
}
