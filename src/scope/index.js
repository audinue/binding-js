
var PathObserver = require('./path-observer')

function Scope (object, parent) {
  this.object = object
  this.parent = parent
}

Scope.prototype = {
  root: function () {
    var root = this
    while (root.parent && (root = root.parent)) {}
    return root
  },
  val: function (path, value) {
    var parts, object, part, root, key
    if (value === undefined) {
      if (path instanceof Object) {
        for (var i in path) {
          this.val(i, path[i])
        }
        return this
      }
      parts = path.split('.')
      object = this.object
      while (parts.length) {
        part = parts.shift()
        if (part === '$parent') {
          if (!this.parent) {
            return
          }
          object = this.parent.object
          continue
        } else if (part === '$root') {
          root = this.root()
          if (!root) {
            return
          }
          object = root.object
          continue
        }
        if (!(object instanceof Object)) {
          return
        }
        if (!(part in object)) {
          return
        }
        object = object[part]
      }
      return object
    }
    parts = path.split('.')
    object = this.object
    key = parts.pop()
    if (parts.length) {
      object = this.val(parts.join('.'))
    }
    if (!(object instanceof Object)) {
      return this
    }
    if (object.isObservableObject) {
      object.prop(key, value)
    } else {
      object[key] = value
    }
    return this
  },
  apply: function (path, args) {
    var parts = path.split('.')
    var object = this.object
    var key = parts.pop()
    if (parts.length) {
      object = this.val(parts.join('.'))
    }
    if (!(object instanceof Object)) {
      return
    }
    if (!(object[key] instanceof Function)) {
      return
    }
    return object[key].apply(object, args)
  },
  call: function (path) {
    return this.apply(path, Array.prototype.slice.call(arguments, 1))
  },
  observe: function (path, callback) {
    new PathObserver(path, callback).observe(this.object)
    return this
  },
  unobserve: function (path, callback) {
    throw new Error('Not implemented yet')
  }
}
