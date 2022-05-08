import { exec, spawn } from 'child_process'
import { PathLike } from 'fs'
import { access } from 'fs/promises'
import { promisify } from 'util'
import { basename, dirname, join } from 'path'
import { URL } from 'url'

export * from './git'

export const $ = promisify(exec)

export const stream$ = (cmd: string, cwd: string) => {
  const child = spawn(cmd, {
    stdio: 'inherit',
    shell: true,
    cwd
  })

  return new Promise((resolve, rejected) => {
    child.on('exit', (code, signal) => {
      if (code === 0) resolve(code)
      else rejected({ code, signal })
    })
  })
}

export function parseOrigin(rawOrigin: string) {
  // 补全转换scp形式的origin
  const cookedOrigin = rawOrigin.startsWith('git@')
    ? `ssh://${rawOrigin.replace(':', '/')}`
    : rawOrigin
  const { hostname, pathname } = new URL(cookedOrigin)
  return {
    hostname,
    pathname: join(dirname(pathname), basename(pathname, '.git'))
  }
}

export function isFileExist(path: PathLike) {
  return access(path)
    .then(() => Promise.resolve(true))
    .catch(() => Promise.resolve(false))
}
