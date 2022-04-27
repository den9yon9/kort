import { exec } from 'child_process'
import { PathLike } from 'fs'
import { access } from 'fs/promises'
import { promisify } from 'util'

export const $ = promisify(exec)

export function isBranchExist(path: string, branch: string) {
  return $(`git rev-parse --verify ${branch}`, { cwd: path })
    .then(() => Promise.resolve(true))
    .catch(() => Promise.resolve(false))
}

export function isRepository(path: string) {
  return $('git rev-parse --is-inside-work-tree', { cwd: path })
    .then(() => Promise.resolve(true))
    .catch((err) => Promise.resolve(false))
}

export function isFileExist(path: PathLike) {
  return access(path)
    .then(() => Promise.resolve(true))
    .catch(() => Promise.resolve(false))
}

export function isEmptyRepository(path: string) {
  return $('git log', { cwd: path })
    .then(() => Promise.resolve(false))
    .catch(() => Promise.resolve(true))
}


