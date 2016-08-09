const getPort = require('get-server-port')
const concat = require('concat-stream')
const series = require('run-series')
const http = require('http')
const test = require('tape')

const cache = require('./cache')
const render = require('./')

test('server-render', (t) => {
  t.test('should assert input types', function (t) {
    t.plan(3)
    t.throws(render, /function/)
    t.throws(render.bind(null, 123), /function/)
    t.throws(render.bind(null, 123, 456), /object/)
  })

  t.test('should create middleware for an http server', (t) => {
    t.plan(4)
    const expected = '<main>hey</main>'
    const renderer = render((route) => {
      t.equal(route, '/foo')
      return expected
    })
    const server = http.createServer(renderer)
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

test('server-render/cache', (t) => {
  t.test('should assert input types', (t) => {
    t.plan(4)
    t.throws(cache, /function/)
    t.throws(cache.bind(null, 123), /function/)
    t.throws(cache.bind(null, 123, 456), /function/)
    t.throws(cache.bind(null, 123, {}, 123), /function/)
  })

  t.test('should create cached middleware for an http server', (t) => {
    t.plan(7)
    const expected = '<main>hey</main>'
    const routes = {
      routes: [ '/foo', '/bar' ]
    }
    const renderer = cache(routes, (route) => {
      if (route === '/foo' || route === '/bar') {
        return expected
      }
    })
    const server = http.createServer(renderer)
    server.listen()
    const port = getPort(server)

    series([callfoo, callbar], (err) => {
      t.ifError(err, 'no err')
      server.close()
    })

    function callfoo (done) {
      http.get(`http://localhost:${port}/foo`, (res) => {
        res.pipe(concat(function (buf) {
          const str = String(buf)
          t.ok(/text\/html/.test(res.headers['content-type']), 'content type')
          t.ok(/DOCTYPE html/.test(str), 'is html')
          t.ok(new RegExp(expected).test(str), 'contains expected')
          done()
        }))
      })
    }

    function callbar (done) {
      http.get(`http://localhost:${port}/bar`, (res) => {
        res.pipe(concat(function (buf) {
          const str = String(buf)
          t.ok(/text\/html/.test(res.headers['content-type']), 'content type')
          t.ok(/DOCTYPE html/.test(str), 'is html')
          t.ok(new RegExp(expected).test(str), 'contains expected')
          done()
        }))
      })
    }
  })

  t.test('should call a default route if none other is found', (t) => {
    t.plan(7)
    const wrong = '<main>hey</main>'
    const expected = '<main>hey</main>'
    const routes = {
      routes: [ '/bar' ],
      default: '/404'
    }
    const renderer = cache(routes, (route) => {
      if (route === '/404') {
        return expected
      } else {
        return wrong
      }
    })
    const server = http.createServer(renderer)
    server.listen()
    const port = getPort(server)

    series([call404, callbar], (err) => {
      t.ifError(err, 'no err')
      server.close()
    })

    function call404 (done) {
      http.get(`http://localhost:${port}/defnot404`, (res) => {
        res.pipe(concat(function (buf) {
          const str = String(buf)
          t.ok(/text\/html/.test(res.headers['content-type']), 'content type')
          t.ok(/DOCTYPE html/.test(str), 'is html')
          t.ok(new RegExp(expected).test(str), 'contains expected')
          done()
        }))
      })
    }
    function callbar (done) {
      http.get(`http://localhost:${port}/bar`, (res) => {
        res.pipe(concat(function (buf) {
          const str = String(buf)
          t.ok(/text\/html/.test(res.headers['content-type']), 'content type')
          t.ok(/DOCTYPE html/.test(str), 'is html')
          t.ok(new RegExp(wrong).test(str), 'contains expected')
          done()
        }))
      })
    }
  })
})
