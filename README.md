# node-github-webhook
Github Webhooks handler based on Node.js. Support multiple handlers.

## Language

- [中文](https://github.com/excaliburhan/node-github-webhook/blob/master/docs/zh_CN.md)

## Instructions

This library is inspired by [github-webhook-handler](https://github.com/rvagg/github-webhook-handler), and it allows you set multiple handlers for different repositories.

It is a small tool based on Node.js to help you handler all the logic for receiving and verifying webhook requests from GitHub.

If you want to know the events of Github, please see: [events](https://developer.github.com/webhooks/#events).

Notice: Github Webhooks setting: `Content-type` must be `application/json`.

## Installation

`npm install node-github-webhook --save`

## Usage

```js
var http = require('http')
var createHandler = require('node-github-webhook')
var handler = createHandler([ // multiple handlers
  { path: '/webhook1', secret: 'secret1' },
  { path: '/webhook2', secret: 'secret2' }
])
// var handler = createHandler({ path: '/webhook1', secret: 'secret1' }) // single handler

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
  switch(event.path) {
    case '/webhook1':
      // do sth about webhook1
      break
    case '/webhook2':
      // do sth about webhook2
      break
    default:
      // do sth else or nothing
      break
  }
})
```
