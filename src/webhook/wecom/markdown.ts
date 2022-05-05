import safeStringify from 'fast-safe-stringify'

export function color(color: string, text: string) {
  return `<font color=${color}>${text}</font>`
}

export function trim(text: string) {
  return text.trim()
}

export function quote(text: string) {
  return `> ${text}`
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
  return color('info', text)
}
export function comment(text: string) {
  return color('comment', text)
}

export function list(list: string[]) {
  return `\n${list.filter(Boolean).join('\n')}`
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
