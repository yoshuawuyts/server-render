var hyperstream = require('hyperstream')
var index = require('simple-html-index')
var assert = require('assert')
var xtend = require('xtend')
var pump = require('pump')

var contentType = 'text/html; charset=utf-8'
var contentCheck = new RegExp('text/html')

var defaultOpts = {
  entry: 'bundle.js',
  css: 'bundle.css',
  favicon: true
}

module.exports = serverRender

// HTML server rendering middleware
// (obj?, fn(str) -> str) -> fn(obj, obj, fn)
function serverRender (opts, handler) {
  if (!handler) {
    handler = opts
    opts = {}
  }

  assert.equal(typeof opts, 'object', 'server-render: opts should be an object')
  assert.equal(typeof handler, 'function', 'server-render: handler should be a function')

  var indexOpts = xtend(defaultOpts, opts)

  // call middlewarereadme
  // (obj, obj, fn) -> null
  return function (req, res, next) {
    if (!contentCheck.test(req.headers['accept'])) return next()
    res.setHeader('Content-Type', contentType)

    var html = handler(req.url)
    var hs = hyperstream({ 'body': { _appendHtml: html } })

    pump(index(indexOpts), hs, res)
  }
}
