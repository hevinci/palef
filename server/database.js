var Promise = require('es6-promise').Promise;
var client = require('mongodb').MongoClient;
var dbUrl = 'mongodb://localhost:27017/palef';
var hasBeenOpened = false;
var db;

var Api = module.exports = {};

Api.open = function () {
  return new Promise(function (resolve, reject) {
    client.connect(dbUrl, function(error, _db) {
      if (error) {
        reject(error);
      } else {
        if (!hasBeenOpened) {
          hasBeenOpened = true;
          _db.collection('traces')
            .ensureIndex('time', { unique: true }, function (error) {
              if (error) {
                reject(error);
              } else {
                db = _db;
                resolve();
              }
            });
        } else {
          db = _db;
          resolve();
        }
      }
    });
  });
};

Api.close = function () {
  if (db) {
    db.close();
    db = null;
  }
};

Api.saveTraces = function (traces) {
  return new Promise(function (resolve, reject) {
    if (!db) {
      return reject(Error('No connection opened'));
    }

    db.collection('traces').insert(traces, function (error, result) {
      return error ? reject(Error(error)) : resolve(result);
    });
  });
};

Api.fetchTraces = function () {
  return new Promise(function (resolve, reject) {
    if (!db) {
      return reject(Error('No connection opened'));
    }

    db.collection('traces').find({}).toArray(function (error, traces) {
      return error ? reject(Error(error)) : resolve(traces);
    });
  });
};
