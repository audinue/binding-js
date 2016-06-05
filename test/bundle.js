/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	var convert = __webpack_require__(1).convert
	var bind = __webpack_require__(1).bind

	var o = convert({name: 'John'})

	bind(o, document.body, {
	  '.name': {
	    text: 'name + " Doe"'
	  },
	  'input': {
	    prop: {
	      value: 'name'
	    }
	  }
	})

	document.querySelector('input').oninput = function () {
	  o.prop('name', this.value)
	}

	bind(o, document.body, {
	  'div': {
	    style: {
	      left: 'x + 10 + "px"',
	      top: 'y + 10 + "px"',
	    },
	    if: 'name'
	  }
	})

	document.onmousemove = function(e) {
	  o.prop({
	    x: e.pageX,
	    y: e.pageY,
	  })
	}

	o.prop('fruits', convert([
	  {name: 'Apple'},
	  {name: 'Banana'},
	  {name: 'Cherry'},
	]))

	bind(o, document.body, {
	  'ul': {
	    for: ['fruits', {
	      'li': {
	        text: 'name',
	        prop: {
	          item: '$value'
	        }
	      }
	    }]
	  }
	})

	document.querySelector('ul').onclick = function (e) {
	  if (e.target.localName == 'li') {
	    o.fruits.remove(e.target.item)
	  }
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	var Scope = __webpack_require__(2)
	var forEach = __webpack_require__(6).forEach
	var mutate = __webpack_require__(7).mutate

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
	  value: function (element) {
	    return function (value) {
	      element.value = value
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

	exports.convert = __webpack_require__(8).convert

	exports.register = function (type, options) {
	  registered[type] = options
	}

	exports.bind = bind


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = __webpack_require__(3)


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	var PathObserver = __webpack_require__(4)

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
	        } else if (part === '$value') {
	          object = this.object
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
	  },
	  paths: function (expression) {
	    var paths = [];
	    expression.replace(
	      /([a-z_$][a-z0-9_$]*(?:\.[a-z_$][a-z0-9_$]*)*)|(\.([a-z_$][a-z0-9_$]*)*)|(['"](?:\\['"]|[^'"]*)['"])/ig,
	      function (all, path) {
	        if (!path) return
	        paths.push(path)
	      }
	    )
	    return paths;
	  },
	  compile: function (expression) {
	    expression = 'return(' + expression
	      .replace(
	        /([a-z_$][a-z0-9_$]*(?:\.[a-z_$][a-z0-9_$]*)*(\s*\([^\)]*\))?)|(\.([a-z_$][a-z0-9_$]*))|(['"](?:\\['"]|[^'"]*)['"])/ig,
	        function (all, path) {
	          if (!path) return all
	          var args = path.match(/\s*\(([^\)]*)\)$/)
	          if (args) {
	            path = path.replace(/\s*\(([^\)]*)\)$/, '')
	            if(args[1]) return '$s.call("' + path + '",' + args[1] + ')'
	            return '$s.call("' + path + '")'
	          }
	          return '$s.val("' + path + '")'
	        }
	      ) + ')'
	    var scope = this
	    var compiled = new Function('$s', expression)
	    return function() {
	      return compiled(scope)
	    }
	  }
	}

	module.exports = Scope


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	
	var KeyObserver = __webpack_require__(5)

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


/***/ },
/* 5 */
/***/ function(module, exports) {

	
	function KeyObserver (key, next) {
	  this.key = key
	  this.next = next
	  this.object = null
	  this.change = this.change.bind(this)
	}

	KeyObserver.prototype = {
	  change: function (e) {
	    if (e.key === this.key) {
	      this.next.observe(this.object[this.key])
	    }
	  },
	  observe: function (object) {
	    if (this.object && this.object.isObservableObject) {
	      this.object.off('change', this.change)
	    }
	    this.object = object
	    if (object && object.isObservableObject) {
	      object.on('change', this.change)
	    }
	    this.next.observe(object ? object[this.key] : undefined)
	    return this
	  }
	}

	module.exports = KeyObserver


/***/ },
/* 6 */
/***/ function(module, exports) {

	
	exports.forEach = function(array, callback) {
		for(var i = 0, length = array.length; i < length; i++) {
			if(callback(array[i], i, array) === false) {
				break;
			}
		}
		return array;
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	
	var measurements = []
	var mutations = []

	function update () {
	  var callback
	  while ((callback = measurements.shift())) {
	    callback()
	  }
	  while ((callback = mutations.shift())) {
	    callback()
	  }
	  window.requestAnimationFrame(update)
	}

	window.requestAnimationFrame(update)

	exports.measure = function (callback) {
	  measurements.push(callback)
	}

	exports.mutate = function (callback) {
	  mutations.push(callback)
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	exports.observable = __webpack_require__(9)
	exports.observableObject = __webpack_require__(10)
	exports.observableArray = __webpack_require__(11)
	exports.convert = __webpack_require__(12)


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	
	var forEach = __webpack_require__(6).forEach

	function observable (object) {
	  if (!(object instanceof Object)) {
	    return object
	  }
	  if (object.isObservable) {
	    return object
	  }
	  var observers = {}
	  return Object.defineProperties(object, {
	    isObservable: {
	      value: true
	    },
	    on: {
	      value: function (type, callback) {
	        if (observers[type] === undefined) {
	          observers[type] = []
	        }
	        observers[type].push(callback)
	        return object
	      }
	    },
	    off: {
	      value: function (type, callback) {
	        if (type === undefined) {
	          observers = {}
	          return object
	        }
	        if (callback === undefined) {
	          observers[type] = []
	          return object
	        }
	        if (observers[type] === undefined) {
	          return object
	        }
	        forEach(observers[type], function (value, index) {
	          if (value === callback) {
	            observers[type].splice(index, 1)
	            return false
	          }
	        })
	        return object
	      }
	    },
	    once: {
	      value: function (type, callback) {
	        var once = function () {
	          object.off(type, callback).off(type, once)
	        }
	        return object.on(type, callback).on(type, once)
	      }
	    },
	    notify: {
	      value: function (message) {
	        if (observers[message.type] === undefined) {
	          return object
	        }
	        forEach(observers[message.type].slice(0), function (callback) {
	          callback(message)
	        })
	        return object
	      }
	    }
	  })
	}

	module.exports = observable


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	
	var observable = __webpack_require__(9)

	function observableObject (object) {
	  if (!(object instanceof Object)) {
	    return object
	  }
	  if (object.isObservableObject) {
	    return object
	  }
	  return Object.defineProperties(observable(object), {
	    isObservableObject: {
	      value: true
	    },
	    prop: {
	      value: function (key, value) {
	        if (value === undefined) {
	          if (key instanceof Object) {
	            for (var i in key) {
	              object.prop(i, key[i])
	            }
	            return object
	          }
	          return object[key]
	        }
	        if (object[key] !== value) {
	          object[key] = value
	          object.notify({
	            type: 'change',
	            key: key
	          })
	        }
	        return object
	      }
	    }
	  })
	}

	module.exports = observableObject


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	
	var observableObject = __webpack_require__(10)

	function observableArray (object) {
	  if (!(object instanceof Array)) {
	    return object
	  }
	  if (object.isObservableArray) {
	    return object
	  }
	  return Object.defineProperties(observableObject(object), {
	    isObservableArray: {
	      value: true
	    },
	    append: {
	      value: function (value) {
	        object.push(value)
	        return object.notify({
	          type: 'append',
	          value: value
	        }).notify({
	          type: 'change',
	          key: 'length'
	        })
	      }
	    },
	    prepend: {
	      value: function (value) {
	        object.unshift(value)
	        return object.notify({
	          type: 'prepend',
	          value: value
	        }).notify({
	          type: 'change',
	          key: 'length'
	        })
	      }
	    },
	    remove: {
	      value: function (value) {
	        var key = object.indexOf(value)
	        if (key === -1) {
	          return object
	        }
	        object.splice(key, 1)
	        return object.notify({
	          type: 'remove',
	          key: key,
	          value: value
	        }).notify({
	          type: 'change',
	          key: 'length'
	        })
	      }
	    }
	  })
	}

	module.exports = observableArray


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	
	var observableObject = __webpack_require__(10)
	var observableArray = __webpack_require__(11)

	function convert (object) {
	  if (object instanceof Array) {
	    return observableArray(object)
	  }
	  return observableObject(object)
	}

	module.exports = convert


/***/ }
/******/ ]);