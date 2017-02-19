# server-render [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

HTML server rendering middleware. Detects if an incoming request is requesting
`text/html` and calls a function to render the corresponding response.

## Usage
Assuming the client is a [choo](https://github.com/yoshuawuyts/choo) app:
```js
var render = require('server-render')
var merry = require('merry')
var client = require('./client')

var app = merry()
app.use(render(function (route) {
  return client.toString(route))
})
app.start()
```

## Caching
Sometimes you know the paths you're going to render up front, and want to cache
them in a Node buffer so the reponse times are as fast as they can be.
```js
var cache = require('server-render/cache')
var render = require('server-render')
var merry = require('merry')
var client = require('./client')

var routes = {
  default: '/404',
  routes: [ '/', '/bar', '/bar/baz', '/bar/:foobar' ]
}

var app = merry()
app.use(cache(routes, function (route) {
  return client.toString(route))
})
app.start()
```

## API
### middleware = render(handler(route))
Create a new render function that takes a callback and returns a middleware
function. The callback should return a string synchronously. The middleware
function has the signature of `(req, res, next)`.

### middleware = cache(routes, handler(route))
Cache routes into Node buffers. Takes an object containing a `.routes` array
of routes, and a `.default` value for the default route to match if no other
routes could be matched.

## Installation
```sh
$ npm install server-render
```

## See Also
- [merry](https://github.com/yoshuawuyts/merry)
- [http-middleware](https://github.com/yoshuawuyts/http-middleware)
- [choo](https://github.com/yoshuawuyts/choo)
- [vas](https://github.com/ahdinosaur/vas)

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/server-render.svg?style=flat-square
[3]: https://npmjs.org/package/server-render
[4]: https://img.shields.io/travis/yoshuawuyts/server-render/master.svg?style=flat-square
[5]: https://travis-ci.org/yoshuawuyts/server-render
[6]: https://img.shields.io/codecov/c/github/yoshuawuyts/server-render/master.svg?style=flat-square
[7]: https://codecov.io/github/yoshuawuyts/server-render
[8]: http://img.shields.io/npm/dm/server-render.svg?style=flat-square
[9]: https://npmjs.org/package/server-render
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
