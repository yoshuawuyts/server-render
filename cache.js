var hyperstream = require('hyperstream')
var index = require('simple-html-index')
var assert = require('assert')
var xtend = require('xtend')
var pump = require('pump')
var bl = require('bl')

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
function serverRender (opts, routes, handler) {
  if (!handler) {
    handler = routes
    routes = opts
    opts = {}
  }

  var cache = {}

  assert.equal(typeof opts, 'object', 'server-render: opts should be a function')
  assert.equal(typeof routes, 'object', 'server-render: routes should be a function')
  assert.equal(typeof handler, 'function', 'server-render: handler should be a function')

  routes.routes.forEach(function (route) {
    var buf = cacheRoute(route)
    cache[route] = buf
  })

  var defaultRoute = cacheRoute(routes.default)
  var indexOpts = xtend(defaultOpts, opts)

  // call middlewarereadme
  // (obj, obj, fn) -> null
  return function (req, res, next) {
    if (!contentCheck.test(req.headers['accept'])) return next()
    res.setHeader('Content-Type', contentType)

    if (cache[req.url]) {
      pump(cache[req.url].duplicate(), res)
    } else {
      res.statusCode = 404
      pump(defaultRoute.duplicate(), res)
    }
  }

  // cache a route in the cache
  // str -> Buffer
  function cacheRoute (route) {
    var html = handler(route)
    var hs = hyperstream({ 'body': { _appendHtml: html } })
    var buf = bl()
    pump(index(indexOpts), hs, buf)
    return buf
  }
}
