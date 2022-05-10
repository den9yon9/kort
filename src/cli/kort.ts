#!/usr/bin/env node

import app from '../server'
import configuration from '../configuration'
import { green } from 'kolorist'
import Dispatcher from '../dispatch'
import Schedule from '../schedule'
import axios from 'axios'
import { argv, cmd } from './parseArgv'
import install from './install'

const { origin, branch, compare, cron, port = 3010 } = argv

configuration().then((workspaces) => {
  ;({
    help,
    install,
    kort: help,
    serve,
    build: () => build(origin, branch, compare),
    version
  }[cmd]?.())

  async function serve() {
    // TODO: check workspaces
    const dispatcher = new Dispatcher(workspaces)

    app.context.dispatcher = dispatcher
    app.listen(port)
    console.log(`\n服务已启动port: ${green(port)}`)
    if (!cron) return
    const pattern = typeof cron === 'boolean' ? '*/5 * * * *' : cron
    new Schedule(pattern, dispatcher)
    console.log(`定时任务已启动: ${green(pattern)}\n`)
  }

  async function build(origin: string, branch: string, compare) {
    try {
      const response = await axios.post(`http://localhost:${port}/build`, {
        origin,
        branch,
        compare
      })
      if (response) console.log(response.data)
    } catch (err) {
      console.log(`build失败, 请检查是否已启动kort服务: ${err.message}`)
    }
  }

  function help() {
    console.log(
      [
        'kort install',
        'kort serve [--port <port>] [--cron [<pattern>]]',
        'kort build --origin <origin> --branch <branch> [--compare <compare>]'
      ].join('\n')
    )
  }

  function version() {
    console.log(process.env['npm_package_version'])
  }
})
