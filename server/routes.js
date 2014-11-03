var db = require('./database');
var routes = module.exports = {};

routes.admin = function (req, res, next) {
  var cachedStats;

  db.open()
    .then(db.fetchStats)
    .then(function (stats) {
      cachedStats = stats;
    })
    .then(db.fetchTraces)
    .then(function (traces) {
      db.close();
      res.render('admin', { stats: cachedStats, traces: traces });
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
              for (var i = 0; i < stats.modules.length; ++i) {
                if (stats.modules[i].id == trace.module) {
                  stats.modules[i].stepCount = stats.modules[i].steps.length;
                  stats.modules[i].completedSteps = 0;

                  for (var j = 0; j < stats.modules[i].stepCount; ++j) {
                    if (stats.modules[i].steps[j].id == trace.step) {
                      stats.modules[i].steps[j].complete =
                        stats.modules[i].steps[j].complete || trace.complete;
                      stats.modules[i].steps[j].score = trace.score;
                    }

                    if (stats.modules[i].steps[j].complete) {
                      stats.modules[i].completedSteps++;
                    }
                  }
                  break;
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
