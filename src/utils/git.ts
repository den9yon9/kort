import { exec } from 'child_process'
import { promisify } from 'util'

const $ = promisify(exec)

export const popString = (str: string) =>
  str.split('').reverse().join('').substring(1).split('').reverse().join('')

export const gitlog = async (selector: string, cwd: string) => {
  const { stdout } = await $(
    `git log ${selector} --pretty=format:'{"subject": "%s"},'`,
    { cwd }
  )
  return JSON.parse(`[${popString(stdout)}]`)
}

export const gitshow = async (commit: string, cwd: string) => {
  const { stdout } = await $(
    `git show ${commit} --pretty=format:'{"subject": "%s"}'`,
    { cwd }
  )
  return JSON.parse(`[${popString(stdout)}]`)
}

export const shortSelector = (selector: string) =>
  selector
    .split('...')
    .map((item) => item.substring(0, 6))
    .join('...')
