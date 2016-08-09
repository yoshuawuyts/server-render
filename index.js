const hyperstream = require('hyperstream')
const index = require('simple-html-index')
const assert = require('assert')

module.exports = serverRender

// HTML server rendering middleware
// (obj?, fn(str) -> str) -> fn(obj, obj, fn)
function serverRender (opts, handler) {
  if (!handler) {
    handler = opts
    opts = {}
  }

  assert.equal(typeof opts, 'object', 'server-render: opts should be a function')
  assert.equal(typeof handler, 'function', 'server-render: handler should be a function')

  // call middlewarereadme
  // (obj, obj, fn) -> null
  return function (req, res, next) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')

    const html = handler(req.url)
    const hs = hyperstream({ 'body': { _appendHtml: html } })

    index(opts).pipe(hs).pipe(res)
  }
}
