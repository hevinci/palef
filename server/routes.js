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
              // re-compute step score and progress
              for (var i = 0; i < stats.modules.length; ++i) {
                if (stats.modules[i].id == trace.module) {
                  stats.modules[i].stepCount = stats.modules[i].steps.length;

                  for (var j = 0; j < stats.modules[i].stepCount; ++j) {
                    if (stats.modules[i].steps[j].id == trace.step) {
                      stats.modules[i].steps[j].complete =
                        stats.modules[i].steps[j].complete || trace.complete;

                      if (trace.score !== null) {
                        if (trace.score > stats.modules[i].steps[j].score) {
                          stats.modules[i].steps[j].score = trace.score;
                        }
                      }
                    }
                  }
                  break;
                }
              }
            });

            // re-compute module score and progress
            for (var i = 0; i < stats.modules.length; ++i) {
              var moduleScore = null, completedSteps = 0;

              for (var j = 0; j < stats.modules[i].stepCount; ++j) {
                if (stats.modules[i].steps[j].score !== null) {
                  moduleScore += stats.modules[i].steps[j].score;
                }

                if (stats.modules[i].steps[j].complete) {
                  completedSteps++;
                }
              }

              stats.modules[i].score = moduleScore;
              stats.modules[i].completedSteps = completedSteps;
            }

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
