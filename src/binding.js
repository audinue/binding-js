
var Scope = require('./scope')
var forEach = require('utility-js').forEach
var mutate = require('fastdom-js').mutate

var registered = {
  text: function (element) {
    return function (value) {
      element.textContent = value
    }
  },
  html: function (element) {
    return function (value) {
      element.innerHTML = value
    }
  },
  prop: function (element, key) {
    return function (value) {
      element[key] = value
    }
  },
  style: function (element, key) {
    var style = element.style
    return function (value) {
      style[key] = value
    }
  },
  attr: function (element, key) {
    return function (value) {
      element.setAttribute(key, value)
    }
  },
  if: function (element) {
    var parent = element.parentNode
    var comment = document.createComment('')
    var current = true
    return function (value) {
      value = !!value
      if (current !== value) {
        if (value) {
          parent.replaceChild(element, comment)
        } else {
          parent.replaceChild(comment, element)
        }
        current = value
      }
    }
  },
  for: function (element, sub, scope) {
    var template = document.createDocumentFragment()
    while (element.firstChild) {
      template.appendChild(element.firstChild)
    }
    var current = null
    var add = function (value) {
      var instance = template.cloneNode(true)
      bind(value, instance, sub, scope)
      element.appendChild(instance)
    }
    var append = function (e) {
      add(e.value)
    }
    var prepend = function (e) {
      var instance = template.cloneNode(true)
      bind(e.value, instance, sub, scope)
      if (element.firstChild) {
        element.insertBefore(instance, element.firstChild)
      } else {
        element.appendChild(instance)
      }
    }
    var remove = function (e) {
      var length = template.childNodes.length
      var min = e.key * length
      var max = min + length
      for (var i = min; i < max; i++) {
        element.removeChild(element.childNodes[min])
      }
    }
    return function (value) {
      if (current && current.isObservableArray) {
        current
          .off('append', append)
          .off('prepend', prepend)
          .off('remove', remove)
      }
      current = value
      if (current && current.isObservableArray) {
        current
          .on('append', append)
          .on('prepend', prepend)
          .on('remove', remove)
      }
      if (current instanceof Array) {
        forEach(current, add)
      }
    }
  }
}

function bind (object, element, bindings, parent) {
  var scope = new Scope(object, parent)
  var bind = function (selector, type, expression, arg) {
    if (expression instanceof Array) {
      arg = expression[1]
      expression = expression[0]
    }
    forEach(element.querySelectorAll(selector), function (element) {
      var render = registered[type](element, arg, scope)
      var oldValue
      var val = scope.compile(expression)
      var update = function () {
        var value = val()
        if (value !== oldValue) {
          mutate(function () {
            render(value)
          })
          oldValue = value
        }
      }
      forEach(scope.paths(expression), function (path) {
        scope.observe(path, update)
      })
      update()
    })
  }
  for (var selector in bindings) {
    var types = bindings[selector]
    for (var type in types) {
      var value = types[type]
      if (value instanceof Object && !(value instanceof Array)) {
        for (var key in value) {
          bind(selector, type, value[key], key)
        }
      } else {
        bind(selector, type, value)
      }
    }
  }
  return scope
}

exports.convert = require('observable-js').convert

exports.register = function (type, options) {
  registered[type] = options
}

exports.bind = bind
