# server-render [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

HTML server rendering middleware. Detects if an incoming request is requesting
`text/html` and calls a function to render the corresponding response.

## Usage
Assuming the client is a [choo](https://github.com/yoshuawuyts/choo) app:
```js
const render = require('server-render')
const merry = require('merry')
const client = require('./client')

const app = merry()
app.use(render((route) => client.toString(route)))
app.start()
```

## Caching [tbi]
Sometimes you know the paths you're going to render up front, and want to cache
them in a Node buffer so the reponse times are as fast as they can be.
```js
const cache = require('server-render/cache')
const render = require('server-render')
const merry = require('merry')
const client = require('./client')

const routes = {
  default: '/404',
  routes: [ '/', '/bar', '/bar/baz', '/bar/:foobar' ]
}

const app = merry()
app.use(render(cache(routes, (route) => client.toString(route))))
app.start()
```

## API
### middleware = render(handler(route))
Create a new render function that takes a callback and returns a middleware
function. The callback should return a string synchronously. The middleware
function has the signature of `(req, res, next)`.

### handler = cache(routes, handler(route))
Cache routes into a Node buffer. Takes an object containing a `.routes` array
of routes, and a `.default` value for the default route to match if no other
routes could be matched. Can be passed as the `handler` into `render(handler)`
to turn it into middleware.

## Installation
```sh
$ npm install server-render
```

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