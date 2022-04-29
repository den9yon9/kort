import { basename, dirname, join } from 'path'
import { URL } from 'url'

// 补全转换scp形式的origin
function transOrigin(origin: string) {
  if (origin.startsWith('git@')) return `ssh://${origin.replace(':', '/')}`
  else return origin
}

export default function parseOrigin(origin: string) {
  const cookedOrigin = transOrigin(origin)
  const { hostname, pathname } = new URL(cookedOrigin)
  return {
    hostname,
    pathname: join(dirname(pathname), basename(pathname, '.git'))
  }
}
