# 自动打包服务

## 基础配置
- 打包master分支, 只需配置远程仓库地址: 
  
```json
	[
		"****/repository1.git",
		"****/repository2.git",
		...
	]
```

然后执行kort --config "配置文件路径", kort会打包master到home下的kort-release目录, 你只需发布这些打包产物即可


tips: 更新配置文件, 需要重新执行一下kort --config "配置文件路径", 才会生效

## 进阶

### webhook
通常我们希望能知道打包进度或报错信息, 此时我们需要配置一个webhook,   你只需在配置中增加一个webhook字段即可,kort内置了企业微信通知, 如果你想要自定义webhook, 请查看这里


```json
[
	{
		"origin": "****/repository1.git",
		"webhook": "https://***"
	},
	{
		"origin": "****/repository2.git",
		"webhook": "https://***"
	},
	...
]
```

### 打包其它分支
kort默认打包master分支, 如果你想要打包其它分支, 只需这样配置
```json
[
	{
		"origin": "****/repository1.git",
		"webhook": "https://***",
		"branches": ["dev"]
	},
	{
		"origin": "****/repository2.git",
		"webhook": "https://***",
		"branches": ["master", "dev"]
	},
	...
]
```

