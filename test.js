const getPort = require('get-server-port')
const concat = require('concat-stream')
const http = require('http')
const test = require('tape')
const serverRender = require('./')

test('server-render', (t) => {
  t.test('should assert input types', function (t) {
    t.plan(3)
    t.throws(serverRender, /function/)
    t.throws(serverRender.bind(null, 123), /function/)
    t.throws(serverRender.bind(null, 123, 456), /object/)
  })

  t.test('should create middleware for an http server', (t) => {
    t.plan(4)
    const expected = '<main>hey</main>'
    const render = serverRender((route) => {
      t.equal(route, '/foo')
      return expected
    })
    const server = http.createServer((req, res) => {
      render(req, res)
    })
    server.listen()
    const port = getPort(server)
    http.get(`http://localhost:${port}/foo`, (res) => {
      res.pipe(concat(function (buf) {
        const str = String(buf)
        t.ok(/text\/html/.test(res.headers['content-type']), 'content type')
        t.ok(/DOCTYPE html/.test(str), 'is html')
        t.ok(new RegExp(expected).test(str), 'contains expected')
        server.close()
      }))
    })
  })
})
test('server-render/cache')
