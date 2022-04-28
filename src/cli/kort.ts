import * as minimist from 'minimist'
import app from '../server'
import configuration from '../configuration'
import setup from '../environment/setup'
import { green } from 'kolorist'

const argv = minimist(process.argv.slice(2), { string: ['_'] })

const { c: config, p: port = 3008 } = argv

if (!config) throw new Error(`请使用-c指定配置文件路径`)

const workspaces = configuration(config)

;(async () => {
  await setup(workspaces)
  app.context.workspaces = workspaces
  app.listen(+port)
  console.log(green(`服务已启动于${port}端口`))
})()
