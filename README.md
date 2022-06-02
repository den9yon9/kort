# Kort

轻量前端项目自动打包服务

### 安装kort

kort 依赖 nodejs(>=14)和git, 安装kort前确认你已经准备好了nodejs和git

```bash
# 安装yarn pnpm及 kort
$ npm install -g yarn pnpm kort --registry=https://dev-page.iambanban.com/registry/
```

## Useage

### 创建kort项目

新建一个目录, 在目录内创建一个kort.json配置文件

```json
// my-project/kort.json
[
  {
    // 要打包的git远程仓库地址
    "origin": "https://hostname.com/owner/repository.git",
    // 当源码有错误或者不符合打包条件而导致打包失败时, 我们希望kort给用户适当的反馈, kort会将打包消息发送给webhook
    "webhook": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=bc7871a1-7459-4c7c-8e1e-35108f7583fc",
    // kort默认打包master分支, 如果你要打包其它分支可以这样配置
    "branches": ["test", "dev"]
  },
  ...
]
```


### 安装kort项目依赖

配置或更新kort.json后, 在kort项目内执行 kort install 命令, kort将会根据kort.json中的配置, 准备好打包环境

```bash
$ kort install
```

### 运行kort服务
现在可以运行kort服务了: 

```bash
$ kort serve --cron 
```

--cron选项指示kort以定时任务模式运行, 此模式下kort每5min同步一次origin并打包仓库变更;
kort serve默认监听3010端口, 你可以使用--port选项指定其它端口;

> tips: 如果你想由远程仓库的部署钩子触发打包, 以获得更及时的打包体验, 将kort服务地址配置到远程仓库的部署钩子中即可(暂时仅支持gogs和github)

### 守护kort进程
使用你熟悉的方式守护kort进程, 这里以node进程管理模块pm2为例

```bash
# 安装pm2
$ npm i pm2 -g

# 守护kort服务
$ pm2 start kort -- serve ./my-project --cron
```

### 发布打包产物
发布kort项目下的dist, 配置好nginx即可

### 部署nginx配置参考
```
server {
    listen 80;
    server_name  hostname.com;
    index  index.html index.htm index.php;
    root  my-project/owner/repository/master;

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

### 认证文件
如果你需要在dist目录中放置一些认证文件, 直接将认证文件存放在相应的dist根目录下, 然后 commit & push 即可
