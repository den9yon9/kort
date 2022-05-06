import { $, popString } from '.'

export const gitlog = async (selector: string, cwd: string) => {
  const { stdout } = await $(
    `git log ${selector} --pretty=format:'{"subject": "%s"},'`,
    { cwd }
  )
  return JSON.parse(`[${popString(stdout)}]`)
}

export const getSHA1 = async (ref: string, cwd: string) => {
  const { stdout } = await $(`git rev-parse ${ref}`, { cwd })
  return stdout.trim()
}

export const shortSelector = (selector: string) =>
  selector
    .split('...')
    .map((item) => item.substring(0, 6))
    .join('...')

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

export function isEmptyRepository(path: string) {
  return $('git log', { cwd: path })
    .then(() => Promise.resolve(false))
    .catch(() => Promise.resolve(true))
}
