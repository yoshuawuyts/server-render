const hyperstream = require('hyperstream')
const index = require('simple-html-index')
const assert = require('assert')
const xtend = require('xtend')
const pump = require('pump')

const contentType = 'text/html; charset=utf-8'
const contentCheck = new RegExp('text/html')

const defaultOpts = {
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

  const indexOpts = xtend(defaultOpts, opts)

  // call middlewarereadme
  // (obj, obj, fn) -> null
  return function (req, res, next) {
    if (!contentCheck.test(req.headers['accept'])) return next()
    res.setHeader('Content-Type', contentType)

    const html = handler(req.url)
    const hs = hyperstream({ 'body': { _appendHtml: html } })

    pump(index(indexOpts), hs, res)
  }
}
