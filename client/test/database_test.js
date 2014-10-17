var assert = require('assert');
var Database = require('./../src/database').Database;

describe('database', function () {
  var db;
  var stores = [
    {
      name: 'bar',
      keyPath: 'id',
      autoIncrement: true,
      indexes: [
        { field: 'field1', unique: false },
        { field: 'field2', unique: true }
      ]
    },
    {
      name: 'baz',
      keyPath: 'id',
      autoIncrement: true,
      indexes: [
        { field: 'field1', unique: false },
        { field: 'field2', unique: true }
      ]
    }
  ];

  afterEach(function () {
    db.destroy();
  });

  describe('#open', function () {
    it('creates an empty database by default', function (done) {
      db = new Database();
      db.open()
        .then(function (_db) {
          assert.ok(_db instanceof IDBDatabase);
          assert.equal('default', _db.name);
          assert.equal(0, _db.objectStoreNames.length);
        })
        .then(done, done);
    });
    it('creates stores if provided', function (done) {
      db = new Database('test1', stores);
      db.open()
        .then(function (_db) {
          assert.ok(_db instanceof IDBDatabase);
          assert.equal('test1', _db.name);
          assert.deepEqual(
            ['bar', 'baz'],
            [].slice.call(_db.objectStoreNames)
          );
        })
        .then(done, done);
    });
  });

  describe('#add', function () {
    it('creates objects in a given store', function (done) {
      db = new Database('test2', stores);
      db.open()
        .then(function () {
          return db.add('bar', { field1: 'value1', field2: 'value2' });
        })
        .then(done, done);
    });
  });
});
