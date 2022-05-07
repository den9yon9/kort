# Kort

轻量级node自动打包服务

## Install
```bash
$ npm install kort -g	
```

## Useage
### 配置
使用kort, 你需要提供一份配置文件来告诉kort要打包的项目信息, kort默认会读取~/.kortrc.json, 最简单的配置如下

```json
// ~/.kortrc.json

[
  "repository1.git",
  "repository2.git",
]
```

### 运行

随后执行kort, kort将会根据配置文件中的信息,进行打包环境的设置, 设置完成后kort每5分钟同步一次远程仓库,  并将仓库中的变更打包到~/kort-release下, 接下来你只需要到kort-release下找到打包好的文件, 将它们发布出去即可
```bash
$ kort # 你也可以使用-c选项指定配置文件路径
```

### 配置进阶

最简单的配置已经可以完成打包工作了,  但是当源码不符合打包条件时, 或者打包失败时, 我们希望kort给我们适当的反馈, 因此我们需要在配置中添加一个webhook, 以便kort能将打包信息反馈给我们
```json
// ~/.kortrc.json
[
  {
    "origin": "repository1.git",
    // kort内置了企业微信webhook
    "webhook": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=bc7871a1-7459-4c7c-8e1e-35108f7583fc"
  },
  {
    "origin": "repository2.git",
    // 自定义webhook
    "webhook": "https://***"
  }
]

```

kort默认打包分支是master, 如果你自定义打包分支, 可以这样配置
```json
// ~/.kortrc.json
[
  {
    "origin": "repository1.git",
    "webhook": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=bc7871a1-7459-4c7c-8e1e-35108f7583fc",
    "branches": ["prod", "test"]
  },
  {
    "origin": "repository2.git",
    "webhook": "https://***",
    "branches": ["master", "dev"]
  }
]

```


到此为止没有更多配置项了, 但需要注意的是, 当你更改了配置文件后,  你需要重新启动kort来应用这些配置

## 运行模式
kort有两种运行模式:
- 定时任务模式
  定时任务模式是kort默认的运行模式, 在这种模式下, kort每5min会同步一次远程仓库并打包变更

- 服务模式
  使用-s参数可以让kort以服务模式运行, 此时kort会在3008端口启动一个http服务, 将此服务地址配置到远程仓库的webhook钩子中, 就可以由远程仓库触发kort打包


```bash
$ kort -s # 你也可以使用-p参数指定服务端口
```


## release
kort的两种运行模式, 都会将源码打包到~/kort-release目录下, 你只需要到~/kort-release下找到要对应的目录发布出去即可

## 守护kort进程
你可以使用你熟悉的任何方式守护kort进程, 这里以node进程管理模块pm2为例

### 安装pm2
```bash
$ npm i pm2 -g

# 定时任务模式
$ pm2 start kort

# 服务模式
$ pm2 start kort -- -s -p 3009

```
