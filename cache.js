const hyperstream = require('hyperstream')
const index = require('simple-html-index')
const assert = require('assert')
const xtend = require('xtend')
const pump = require('pump')
const bl = require('bl')

const defaultOpts = {
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

  const cache = {}

  assert.equal(typeof opts, 'object', 'server-render: opts should be a function')
  assert.equal(typeof routes, 'object', 'server-render: routes should be a function')
  assert.equal(typeof handler, 'function', 'server-render: handler should be a function')

  routes.routes.forEach(function (route) {
    const buf = cacheRoute(route)
    cache[route] = buf
  })

  const defaultRoute = cacheRoute(routes.default)
  const indexOpts = xtend(defaultOpts, opts)

  // call middlewarereadme
  // (obj, obj, fn) -> null
  return function (req, res, next) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')

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
    const html = handler(route)
    const hs = hyperstream({ 'body': { _appendHtml: html } })
    const buf = bl()
    pump(index(indexOpts), hs, buf)
    return buf
  }
}
