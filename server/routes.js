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
  db.open()
    .then(function () {
      return db.saveTraces(req.body);
    })
    .then(function () {
      db.close();
      res.send('["Traces saved on server"]');
    })
    .catch(next);
};
