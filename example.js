const cache = require('./cache')
const http = require('http')

const routes = { routes: [ '/' ] }
const render = cache(routes, function (route) {
  return '<main>hey</main>'
})

http.createServer(render).listen(8080)
