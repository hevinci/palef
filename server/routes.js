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
  var traces = req.body, cachedStats;

  db.open()
    .then(function () {
      if (traces.length !== 0) {
        return db.saveTraces(traces)
          .then(db.fetchStats)
          .then(function (stats) {
            traces.forEach(function (trace) {
              if (trace.complete) {
                for (var i = 0; i < stats.modules.length; ++i) {
                  if (stats.modules[i].id == trace.module) {
                    for (var j = 0; j < stats.modules[i].steps.length; ++j) {
                      if (stats.modules[i].steps[j].id == trace.step) {
                        stats.modules[i].steps[j].complete = true;
                        stats.modules[i].steps[j].score = trace.score || null;

                        break;
                      }
                    }

                    break;
                  }
                }
              }
            });

            return cachedStats = stats;
          })
          .then(function () {
            return db.saveStats(cachedStats);
          })
          .then(function () {
            return cachedStats;
          })
      }

      return db.fetchStats();
    })
    .then(function (stats) {
      db.close();
      res.send(JSON.stringify(stats));
    })
    .catch(next);
};
