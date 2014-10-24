var db = require('./database');
var routes = module.exports = {};

routes.admin = function (req, res, next) {
  db.open()
    .then(db.fetchTraces)
    .then(function (traces) {
      db.close();
      res.render('admin', { traces: traces });
    })
    .catch(next);
};

routes.traces = function (req, res, next) {
  var msg = '["Progress from server: ' + Date.now() + '"]';

  if (req.body.length === 0) {
    res.send(msg);
  } else {
    db.open()
      .then(function () {
        return db.saveTraces(req.body);
      })
      .then(function () {
        db.close();
        res.send(msg);
      })
      .catch(next);
  }
};
