
var convert = require('../src/binding').convert
var bind = require('../src/binding').bind

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
