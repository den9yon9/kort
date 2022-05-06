import { exec } from 'child_process'
import { PathLike } from 'fs'
import { access } from 'fs/promises'
import { promisify } from 'util'

export { default as parseOrigin } from './parseOrigin'

export * from './git'

export const $ = promisify(exec)

export const popString = (str: string) =>
  str.split('').reverse().join('').substring(1).split('').reverse().join('')

export function isFileExist(path: PathLike) {
  return access(path)
    .then(() => Promise.resolve(true))
    .catch(() => Promise.resolve(false))
}
