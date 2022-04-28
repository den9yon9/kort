[x] 配置加载&解析

[x] 打包环境管理层(根据解析出的配置，准备&更新各种仓库)

[ ] 任务派发层(git compare派发 & 接口派发)

[ ] 任务队列层

[ ] 任务处理层(从派发的任务解析出要打包的项目列表,处理任务里的所有项目)

[x] 打包(解析打包条件&安装依赖&打包)

- 打包工具函数
- 错误收集&归类&记录
- 打包
 
[ ] 提交&发布
[ ] webhook打包进度通知
[ ] markdown

[ ] 服务层(定时&接受push)

[ ] kort-cli

kort reload --config kort.config.json  // 根据配置更新工作区

kort build --workspace path/to/workspace // 更新并打包某个工作区的最新提交

kort build --project path/to/project

kort log --workspace path/to/workspace // 查看日志
