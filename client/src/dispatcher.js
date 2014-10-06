function Dispatcher() {
  this.listeners = {};
}

Dispatcher.prototype.on = function (event, listener) {
  if (this.listeners[event] === undefined) {
    this.listeners[event] = [];
  }

  this.listeners[event].push(listener);
};

Dispatcher.prototype.trigger = function (event, data) {
  this.listeners[event].forEach(function (listener) {
    listener(data);
  });
};

module.exports.Dispatcher = Dispatcher;