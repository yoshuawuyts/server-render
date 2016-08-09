const test = require('tape')
const serverRender = require('./')

test('should assert input types', function (t) {
  t.plan(1)
  t.throws(serverRender)
})
