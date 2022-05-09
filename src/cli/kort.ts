#!/usr/bin/env node

import app from '../server'
import configuration from '../configuration'
import { green } from 'kolorist'
import Dispatcher from '../dispatch'
import Schedule from '../schedule'
import axios from 'axios'
import { argv, cmd } from './parseArgv'
import install from './install'

const { port = 3010, cron, origin, branch, compare } = argv

;({
  help,
  install: () => {
    install().then(() => {
      axios
        .post(`http://localhost:${port}`)
        .then((response) => {
          if (response) console.log(response.data)
        })
        .catch((err) => {})
    })
  },
  kort: help,
  serve: () => serve(port),
  build: () => build(origin, branch, compare),
  version
}[cmd]?.())

async function serve(port: string) {
  // TODO: check workspaces
  const workspaces = configuration()
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
    .then((response) => {
      if (response) console.log(response.data)
    })
    .catch((err) => {
      console.log(`build失败, 请检查是否已启动kort服务: ${err.message}`)
    })
}

function help() {
  console.log(`
kort <command>

Usage:

kort install
kort serve [--port <port>] [--cron [<pattern>]]     
kort build --origin <origin> --branch <branch> [--compare <compare>]

`)
}

function version() {
  console.log(process.env['npm_package_version'])
}
