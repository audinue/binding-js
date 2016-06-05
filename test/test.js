
var Scope = require('../src/scope')
var convert = require('observable-js').convert

console.log(new Scope({foo: 1}).val('foo'))

var o = convert({})

var s = new Scope(o)

s.observe('foo.bar', function () {
  console.log(s.val('foo.bar'))
})

s.val('foo', convert({}))

s.val('foo.bar', 2)
