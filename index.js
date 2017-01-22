/**
 * Github Webhooks handler
*/

var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var crypto = require('crypto')
var bl = require('bl')
var bufferEq = require('buffer-equal-constant-time')

function signBlob(key, blob) {
  return 'sha1=' + crypto.createHmac('sha1', key).update(blob).digest('hex')
}

function isObject(obj) {
  return Object.prototype.toString.apply(obj) === '[object Object]'
}

function findHandler(url, arr) {
  var ret = arr[0]
  for (var i = 0; i < arr.length; i++) {
    if (url.split('?').shift() === arr[i].path)
      ret = arr[i]
  }
  return ret
}

function create(options) {
  // make it an EventEmitter, sort of
  handler.__proto__ = EventEmitter.prototype
  EventEmitter.call(handler)

  return handler

  function handler(req, res, callback) {
    function hasError(msg) {
      res.writeHead(400, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: msg }))

      var err = new Error(msg)
      handler.emit('error', err, req)
      callback(err)
    }

    function checkType(options) {
      if (!isObject(options))
          throw new TypeError('must provide an options object')

      if (typeof options.path !== 'string')
        throw new TypeError('must provide a \'path\' option')
      
      if (typeof options.secret !== 'string')
        throw new TypeError('must provide a \'secret\' option')
    }

    var currentOptions
    if (Array.isArray(options)) {
      currentOptions = findHandler(req.url, options)
    } else {
      currentOptions = options
    }

    checkType(currentOptions)

    if (req.url.split('?').shift() !== currentOptions.path)
      return callback()
    
    var sig = req.headers['x-hub-signature']
    var event = req.headers['x-github-event']
    var id = req.headers['x-github-delivery']
    var events = currentOptions.events

    if (!sig)
      return hasError('No X-Hub-Signature found on request')

    if (!event)
      return hasError('No X-Github-Event found on request')

    if (!id)
      return hasError('No X-Github-Delivery found on request')
    
    if (events && events.indexOf(event) === -1)
      return hasError('X-Github-Event is not acceptable')
    
    req.pipe(bl(function(err, data) {
      if (err)
        return hasError(err.message)

      var obj
      var computedSig = new Buffer(signBlob(currentOptions.secret, data))

      if (!bufferEq(new Buffer(sig), computedSig))
        return hasError('X-Hub-Signature does not match blob signature')

      try {
        obj = JSON.parse(data.toString())
      } catch (e) {
        return hasError(e)
      }

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end('{"ok":true}')

      var emitData = {
        event: event,
        id: id,
        payload: obj,
        protocol: req.protocol,
        host: req.headers['host'],
        url: req.url,
        path: currentOptions.path
      }

      handler.emit(event, emitData)
      handler.emit('*', emitData)
    }))
  }
}

module.exports = create
