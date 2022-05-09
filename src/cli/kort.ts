#!/usr/bin/env node

import app from '../server'
import configuration from '../configuration'
import { green, yellow } from 'kolorist'
import Dispatcher from '../dispatch'
import Schedule from '../schedule'
import axios from 'axios'
import { argv, cmd } from './parseArgv'
import setup from './setup'

const { origin, branch, compare, cron, config, port } = argv

configuration(config).then(({ server, workspaces }) => {
  ;({
    help,
    install,
    kort: help,
    serve,
    build: () => build(origin, branch, compare),
    version
  }[cmd]?.())

  async function install() {
    await setup()
    try {
      const response = await axios.post(
        `http://localhost:${port || server.port}/reload`
      )
      if (response) console.log(response.data + '\n')
    } catch (err) {
      console.log(yellow(`下一步: 运行kort serve启动kort服务\n`))
    }
  }

  async function serve() {
    // TODO: check workspaces
    const dispatcher = new Dispatcher(workspaces)

    app.context.dispatcher = dispatcher
    app.listen(port || server.port)
    console.log(`\n服务已启动port: ${green(port || server.port)}`)
    if (!cron) return
    const pattern = typeof cron === 'boolean' ? '*/5 * * * *' : cron
    new Schedule(pattern, dispatcher)
    console.log(`定时任务已启动: ${green(pattern)}\n`)
  }

  async function build(origin: string, branch: string, compare) {
    try {
      const response = await axios.post(
        `http://localhost:${port || server.port}/build`,
        {
          origin,
          branch,
          compare
        }
      )
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
