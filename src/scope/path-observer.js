
var KeyObserver = require('./key-observer')

function PathObserver (path, callback) {
  this.path = path
  this.callback = callback
}

PathObserver.prototype = {
  observe: function (object) {
    var callback = this.callback
    var parts = this.path.split('.')
    var initialize = true
    var keyObserver = new KeyObserver(parts.pop(), {
      observe: function (object) {
        if (initialize) {
          initialize = false
          return
        }
        callback(object)
      }
    })
    while (parts.length) {
      keyObserver = new KeyObserver(parts.pop(), keyObserver)
    }
    keyObserver.observe(object)
    return this
  }
}

module.exports = PathObserver
