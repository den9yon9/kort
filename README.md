# Kort

轻量前端项目自动打包服务

### 安装kort

kort 依赖 nodejs(>=14)和git, 安装kort前确认你已经准备好了nodejs和git

```bash
# 安装yarn pnpm及 kort
$ npm install -g yarn pnpm kort --registry=https://dev-page.iambanban.com/registry/
```

### 创建kort项目

kort项目是拥有一份kort.json文件的目录, kort会根据kort.json将打完包的代码生成在kort项目中供你发布


```json
// kort.json
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


### 设置打包环境

创建并配置好kort.json后, 执行kort install 命令, kort将会根据kort.json中的配置去clone源码仓库,并准备好打包环境

```bash
$ kort install <projectPath> # 默认projectPath为当前路径
```

> tips: 更新kort.json后, 也需要执行kort install使配置生效


### 运行kort服务

设置好打包环境后, 就可以开启kort服务了
```bash
$ kort serve <projectPath> # 默认projectPath为当前路径
```

kort serve默认监听3010端口, 你可以使用--port选项指定其它端口
```bash
$ kort serve --port 4000
```

接下来你可以将kort服务发布到外网, 并将此服务地址配置到远程仓库的部署钩子中, 就可以由远程仓库触发kort打包

### kort定时任务
如果你不想在外网发布服务, 可以启用kort定时任务, kort每5min会同步一次远程仓库并打包仓库变更
```
$ kort serve --cron
```

### 发布打包产物
发布kort项目下的dist即可

### 守护kort进程
使用你熟悉的方式守护kort进程, 这里以node进程管理模块pm2为例

```bash
# 安装pm2
$ npm i pm2 -g

# 守护kort服务
$ pm2 start kort -- serve

```

### 部署nginx配置参考
```
server {
    listen 80;
    server_name  demo.demain.com;
    index  index.html index.htm index.php;
    root  /Users/zhaoning/kort-release/ee-front/page/master;

    expires -1;

    # 支持browserHistory路由
    location ~ /([^\/]+)/[^.]*$ {
        try_files $uri $uri.html $uri/ /$1/index.html /index.html;
    }

    location ~.*\.(js|css|png|jpg|gif|ico|webp|svg|mp4|mp3|ttf|woff|woff2)$
    {
        expires 365d;
    }

    location ~ /\. {
        deny all;
    }
}
```