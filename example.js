var cache = require('./cache')
var http = require('http')

var routes = { routes: [ '/' ] }
var render = cache(routes, function (route) {
  return '<main>hey</main>'
})

http.createServer(render).listen(8080)
