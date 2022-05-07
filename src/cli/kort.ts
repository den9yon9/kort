#!/usr/bin/env node

import app from '../server'
import configuration from '../configuration'
import setup from '../environment'
import { green } from 'kolorist'
import Dispatcher from '../dispatch'
import Schedule from '../schedule'
import axios from 'axios'
import { argv, cmd } from './parseArgv'

const {
  _: [param1, param2],
  c: config = `${process.env.HOME}/.kortrc.json`,
  p: port = 3008,
  t: time
} = argv

if (cmd === 'kort') kort()
else if (cmd === 'build') build(param1, param2)

function kort() {
  if (!config) throw new Error(`请使用-c指定配置文件路径`)

  const workspaces = configuration(config)
  const dispatcher = new Dispatcher(workspaces)

  setup(workspaces).then(() => {
    app.context.dispatcher = dispatcher
    app.listen(port)
    console.log(green(`\nkort服务已启动于${port}端口\n`))

    if (time) {
      new Schedule(time, dispatcher)
      console.log(green(`\n定时任务已启动(cron pattern: ${time})\n`))
    }
  })
}

function build(origin: string, branch: string) {
  axios
    .post(`http://localhost:${port}/build`, { origin, branch })
    .catch((err) => {
      console.log(err)
      console.log(`build失败, 请检查是否启动kort服务: ${err.message}`)
    })
}
