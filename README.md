# Kort

轻量node自动打包服务

## Install
```bash
# 安装yarn pnpm 
$ npm install -g yarn pnpm

# 安装kort
$ npm install kort -g	--registry=https://dev-page.iambanban.com/registry/
```

### 配置
使用kort, 你需要在home目录下配置一份.kortrc.json来告诉kort要打包的项目信息

```json
// ~/.kortrc.json
[
  {
    // 要打包的git远程仓库地址
    "origin": "repository1.git",
    // 当源码有错误或者不符合打包条件时导致打包失败时, 我们希望kort给用户适当的反馈, kort会将打包消息发送给webhook
    "webhook": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=bc7871a1-7459-4c7c-8e1e-35108f7583fc",
    // kort缺省打包分支是master, 如果你要打包其它分支可以这样配置
    "branches": ["master", "dev"]
  }
]

```


### 设置仓库

配置或更新~/.kortrc.json后, 执行kort install使配置生效

```bash
# ~/.kortrc.json

# kort install 会根据配置clone对应的仓库, 并准备好打包环境
$ kort install

```


### 运行kort服务

kort install完成后, 就可以运行kort服务了

```bash

# kort serve会启动一个http服务, 接下来你可以将此服务发布到外网, 并将此服务地址配置到远程仓库的部署钩子中, 就可以由远程仓库触发kort打包
$ kort serve # 默认监听3010端口, 使用--port选项指定其它端口

# 如果你不想在外网发布服务, 可以启用kort定时任务, kort每5min会同步一次远程仓库并打包仓库变更
$ kort serve --cron # 定时任务默认模式: --cron '*/5 * * * *' (每5min一轮, cron模式语法详见: https://crontab.guru/)

```

## 发布打包产物
kort会将仓库源码打包到~/kort-release目录下, 你只需要到~/kort-release下找到要对应的目录发布出去即可

## 守护kort进程
使用你熟悉的方式守护kort进程, 这里以node进程管理模块pm2为例

```bash
# 安装pm2
$ npm i pm2 -g

# 守护kort服务
$ pm2 start kort serve

# 守护kort服务并开启kort定时任务
$ pm2 start kort serve -- --cron

```
