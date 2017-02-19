var getPort = require('get-server-port')
var concat = require('concat-stream')
var series = require('run-series')
var http = require('http')
var test = require('tape')

var cache = require('./cache')
var render = require('./')

test('server-render', function (t) {
  t.test('should assert input types', function (t) {
    t.plan(3)
    t.throws(render, /function/)
    t.throws(render.bind(null, 123), /function/)
    t.throws(render.bind(null, 123, 456), /object/)
  })

  t.test('should create middleware for an http server', function (t) {
    t.plan(4)
    var expected = '<main>hey</main>'
    var renderer = render(function (route) {
      t.equal(route, '/foo')
      return expected
    })
    var server = http.createServer(renderer)
    server.listen()
    var port = getPort(server)
    var opts = {
      headers: { accept: 'text/html' },
      href: `http://localhost:${port}/foo`
    }
    http.get(opts, function (res) {
      res.pipe(concat(function (buf) {
        var str = String(buf)
        t.ok(/text\/html/.test(res.headers['content-type']), 'content type')
        t.ok(/DOCTYPE html/.test(str), 'is html')
        t.ok(new RegExp(expected).test(str), 'contains expected')
        server.close()
      }))
    })
  })
})

test('server-render/cache', function (t) {
  t.test('should assert input types', function (t) {
    t.plan(4)
    t.throws(cache, /function/)
    t.throws(cache.bind(null, 123), /function/)
    t.throws(cache.bind(null, 123, 456), /function/)
    t.throws(cache.bind(null, 123, {}, 123), /function/)
  })

  t.test('should create cached middleware for an http server', function (t) {
    t.plan(7)
    var expected = '<main>hey</main>'
    var routes = {
      routes: [ '/foo', '/bar' ]
    }
    var renderer = cache(routes, function (route) {
      if (route === '/foo' || route === '/bar') {
        return expected
      }
    })
    var server = http.createServer(renderer)
    server.listen()
    var port = getPort(server)

    series([callfoo, callbar], function (err) {
      t.ifError(err, 'no err')
      server.close()
    })

    function callfoo (done) {
      http.get(`http://localhost:${port}/foo`, function (res) {
        res.pipe(concat(function (buf) {
          var str = String(buf)
          t.ok(/text\/html/.test(res.headers['content-type']), 'content type')
          t.ok(/DOCTYPE html/.test(str), 'is html')
          t.ok(new RegExp(expected).test(str), 'contains expected')
          done()
        }))
      })
    }

    function callbar (done) {
      http.get(`http://localhost:${port}/bar`, function (res) {
        res.pipe(concat(function (buf) {
          var str = String(buf)
          t.ok(/text\/html/.test(res.headers['content-type']), 'content type')
          t.ok(/DOCTYPE html/.test(str), 'is html')
          t.ok(new RegExp(expected).test(str), 'contains expected')
          done()
        }))
      })
    }
  })

  t.test('should call a default route if none other is found', function (t) {
    t.plan(7)
    var wrong = '<main>hey</main>'
    var expected = '<main>hey</main>'
    var routes = {
      routes: [ '/bar' ],
      default: '/404'
    }
    var renderer = cache(routes, function (route) {
      if (route === '/404') {
        return expected
      } else {
        return wrong
      }
    })
    var server = http.createServer(renderer)
    server.listen()
    var port = getPort(server)

    series([call404, callbar], function (err) {
      t.ifError(err, 'no err')
      server.close()
    })

    function call404 (done) {
      http.get(`http://localhost:${port}/defnot404`, function (res) {
        res.pipe(concat(function (buf) {
          var str = String(buf)
          t.ok(/text\/html/.test(res.headers['content-type']), 'content type')
          t.ok(/DOCTYPE html/.test(str), 'is html')
          t.ok(new RegExp(expected).test(str), 'contains expected')
          done()
        }))
      })
    }
    function callbar (done) {
      http.get(`http://localhost:${port}/bar`, function (res) {
        res.pipe(concat(function (buf) {
          var str = String(buf)
          t.ok(/text\/html/.test(res.headers['content-type']), 'content type')
          t.ok(/DOCTYPE html/.test(str), 'is html')
          t.ok(new RegExp(wrong).test(str), 'contains expected')
          done()
        }))
      })
    }
  })
})
