# node-github-webhook
基于Node.js的Github Webhooks工具, 支持设置多个项目。

## 介绍

这个库受到[github-webhook-handler](https://github.com/rvagg/github-webhook-handler)启发而来，它支持你为多个仓库同时设置项目。

该库基于Node.js，能帮你处理所有来自Github的webhooks请求。

如果你想要了解Github支持的Webhooks事件，请看：[events](https://developer.github.com/webhooks/#events)。

注意：Github Webhooks中的设置: `Content-type` 必须是 `application/json`。

## 安装

`npm install node-github-webhook --save`

## 使用

```js
var http = require('http')
var createHandler = require('node-github-webhook')
var handler = createHandler([ // 多个项目
  { path: '/webhook1', secret: 'secret1' },
  { path: '/webhook2', secret: 'secret2' }
])
// var handler = createHandler({ path: '/webhook1', secret: 'secret1' }) // 单个项目

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(7777)

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', function (event) {
  console.log(
    'Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref
  )
  switch (event.path) {
    case '/webhook1':
      // 处理webhook1
      break
    case '/webhook2':
      // 处理webhook2
      break
    default:
      // 处理其他
      break
  }
})
```
