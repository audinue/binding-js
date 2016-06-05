

```html
<p>Hello <b class="name"></b>!</p>

<script src="binding.js"></script>
<script>
var object = binding.convert({
	name: 'John Doe'
})
binding.bind(object, document, {
	'.name': 'name'
})
</script>
```

```javascript
bindings = {
	selector: {
		type: value
	}
}
value = 'expression'
value = {
	'key': 'expression'
}
```

```javascript
binding.registerFormat('name', function (value) {})

binding.register({
	type: {
		test: function (element, value, key) {}
		render: function (element, value, key) {}
	}
})

binding.register({
	text: {
		test: function (element, value) {
			return element.textContent !== value
		},
		render: function (element, value) {
			element.textContent = value
		}
	},
	prop: {
		test: function (element, value, key) {
			return element[key] !== value
		}
		render: function (element, value, key) {
			element[key] = value
		}
	}
})
```