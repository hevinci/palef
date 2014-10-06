function Router() {
  this.regexes = [];
  this.handlers = [];
}

Router.prototype.add = function (regex, handler) {
  this.regexes.push(regex);
  this.handlers.push(handler);
};

Router.prototype.start = function () {
  window.onhashchange = this.execute.bind(this);
  document.body.onload = this.execute.bind(this);
};

Router.prototype.execute = function (hash) {
  var hash = hash || location.hash;
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

module.exports = Router;