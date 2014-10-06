function Router() {
  this.regexes = [];
  this.handlers = [];
}

Router.prototype.add = function (regex, handler) {
  this.regexes.push(regex);
  this.handlers.push(handler);
};

Router.prototype.start = function () {
  window.onhashchange = this._handleHashChange.bind(this);
  document.body.onload = this._handleHashChange.bind(this);
};

Router.prototype.execute = function (hash) {
  var match = null;

  for (var i = 0, max = this.regexes.length; i < max; ++i) {
    match = hash.match(this.regexes[i]);

    if (match) {
      match.shift();
      this.handlers[i].apply(null, match);

      return true;
    }
  }

  return false;
};

Router.prototype._handleHashChange = function () {
  this.execute(location.hash);
};

module.exports = Router;