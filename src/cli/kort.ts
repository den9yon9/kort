#!/usr/bin/env node

import app from '../server'
import configuration from '../configuration'
import { green } from 'kolorist'
import Dispatcher from '../dispatch'
import Schedule from '../schedule'
import axios from 'axios'
import { argv, cmd } from './parseArgv'
import install from './install'

const { port = 3008, cron, origin, branch, compare } = argv
// 配置文件存放在~/.kortrc.json
const config = `${process.env.HOME}/.kortrc.json`

;({
  help,
  install,
  kort: install,
  serve: () => serve(port),
  build: () => build(origin, branch, compare),
  version
}[cmd]?.())

async function serve(port: string) {
  // TODO: check workspaces
  const workspaces = configuration(config)
  const dispatcher = new Dispatcher(workspaces)

  app.context.dispatcher = dispatcher
  app.listen(port)
  console.log(`\n服务已启动port: ${green(port)}`)
  if (!cron) return
  const pattern = typeof cron === 'boolean' ? '*/5 * * * *' : cron
  new Schedule(pattern, dispatcher)
  console.log(`定时任务已启动: ${green(pattern)}\n`)
}

function build(origin: string, branch: string, compare) {
  axios
    .post(`http://localhost:${port}/build`, { origin, branch, compare })
    .catch((err) => {
      console.log(`build失败, 请检查是否已启动kort服务: ${err.message}`)
    })
    .then((response) => {
      if (response) console.log(response.data)
    })
}

function help() {
  // TODO: help
  // console.log(`
  //   kort 下载&配置仓库
  //   kort install 下载&配置仓库
  //   kort serve --port 3008 --cron '*5 * * * *' // 运行服务
  //   kort build --origin origin --branch master --compare compare
  //   kort version
  // `)
}

function version() {
  console.log(process.env['npm_package_version'])
}
