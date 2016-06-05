
var Scope = require('../src/scope');

var s = new Scope({
  foo: {
    bar: 2
  }
})

var f = s.compile('foo.bar + "px"')

console.log(f())
