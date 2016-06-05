
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
