var Promise = require('es6-promise').Promise;
var client = require('mongodb').MongoClient;
var dbUrl = 'mongodb://localhost:27017/palef';
var isInitialized = false;
var db;

var Api = module.exports = {};

Api.open = function () {
  var openPromise = new Promise(function (resolve, reject) {
    client.connect(dbUrl, function (error, _db) {
      if (error) {
        reject(Error(error));
      } else {
        db = _db;
        resolve();
      }
    });
  });

  if (!isInitialized) {
    return openPromise
      .then(ensureIndex)
      .then(loadModuleStats)
      .then(function () {
        isInitialized = true;
      });
  }

  return openPromise;
};

Api.close = function () {
  if (db) {
    db.close();
    db = null;
  }
};

Api.saveTraces = function (traces) {
  return insert('traces', traces);
};

Api.saveStats = function (stats) {
  return clear('statistics')
    .then(function () {
      return insert('statistics', stats);
    });
};

Api.fetchTraces = function () {
  return findAll('traces');
};

Api.fetchStats = function () {
  return findOne('statistics', {}, { fields: { _id: 0 } });
};

function ensureIndex () {
  return new Promise(function (resolve, reject) {
    db.collection('traces')
      .ensureIndex('time', { unique: true }, function (error) {
        if (error) {
          return reject(Error(error));
        }

        resolve();
      });
  });
}

function loadModuleStats() {
  return new Promise(function (resolve, reject) {
    var moduleStats = [];
    var modules = [
      require('./../fixtures/module/module1'),
      require('./../fixtures/module/module2'),
      require('./../fixtures/module/module3'),
      require('./../fixtures/module/module4'),
      require('./../fixtures/module/module5'),
      require('./../fixtures/module/module6'),
      require('./../fixtures/module/module7'),
      require('./../fixtures/module/module8'),
      require('./../fixtures/module/module9'),
      require('./../fixtures/module/module10'),
      require('./../fixtures/module/module11')
    ];
    modules.forEach(function (module) {
      var moduleScore = null, moduleMax = null;
      var steps = module.steps.map(function (step) {
        var score = null, max = null;

        if (step.type === 'quiz-choice') {
          moduleScore = moduleScore === null ? 0 : moduleScore;
          moduleMax = moduleMax === null ? 0 : moduleMax;
          score = 0;
          max = 0;

          if (step.data.challenge.type === 'multiple') {
            step.data.solutions.forEach(function (solution) {
              max += solution.score;
              moduleMax += solution.score;
            });
          } else if (step.data.challenge.type === 'single') {
            max = step.data.solutions.reduce(function (prev, curr) {
              return curr.score > prev ? curr.score : prev;
            }, 0);
            moduleMax += max;
          }
        }

        return {
          id: step.id,
          complete: false,
          score: score,
          max: max
        };
      });

      moduleStats.push({
        id: module.id,
        title: module.title,
        stepCount: module.steps.length,
        completedSteps: 0,
        score: moduleScore,
        max: moduleMax,
        steps: steps
      });
    });
    var collection = db.collection('statistics');
    collection.remove(function (error) {
      if (error) {
        return reject(Error(error));
      }

      collection.insert({ modules: moduleStats }, function (error) {
        if (error) {
          return reject(Error(error));
        }

        resolve();
      });
    });
  });
}

function insert(collection, documents) {
  return new Promise(function (resolve, reject) {
    if (!db) {
      return reject(Error('No connection opened'));
    }

    db.collection(collection).insert(documents, function (error, result) {
      return error ? reject(Error(error)) : resolve(result);
    });
  });
}

function findAll(collection) {
  return new Promise(function (resolve, reject) {
    if (!db) {
      return reject(Error('No connection opened'));
    }

    db.collection(collection).find({}).toArray(function (error, result) {
      return error ? reject(Error(error)) : resolve(result);
    });
  });
}

function findOne(collection, query, options) {
  return new Promise(function (resolve, reject) {
    if (!db) {
      return reject(Error('No connection opened'));
    }

    db.collection(collection)
      .findOne(query, options, function (error, document) {
        return error ? reject(Error(error)) : resolve(document);
      });
  });
};

function clear(collectionName) {
  return new Promise(function (resolve, reject) {
    if (!db) {
      return reject(Error('No connection opened'));
    }

    db.collection(collectionName).remove(function (error) {
      if (error) {
        return reject(Error(error));
      }

      resolve();
    });
  });
}
