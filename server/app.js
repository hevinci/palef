var http = require('http');
var assert = require('assert');
var fs = require('fs');
var nodeStatic = require('node-static');
var dot = require('dot');
var mongoClient = require('mongodb').MongoClient;
var dbUrl = 'mongodb://localhost:27017/palef';
var templateFile = fs.readFileSync(__dirname + '/template/admin.dot', 'utf8');
var adminTemplate = dot.template(templateFile);
var fileServer = new nodeStatic.Server(__dirname + '/../public');

require('http').createServer(function (request, response) {
  var body = '';

  request.addListener('data', function (data) {
    body += data;
  });

  request.addListener('end', function () {
    if (request.url === '/traces') {
      request.method !== 'POST' ?
        errorPage(response, 405) :
        tracesPage(body, response);
    } else if (request.url === '/admin') {
      adminPage(response);
    } else {
      fileServer.serve(request, response, function (error) {
        if (error && (error.status === 404)) {
          errorPage(response, 404);
        }
      });
    }
  }).resume();
}).listen(1337);

function errorPage(response, status) {
  response.writeHead(status, {'Content-Type': 'text/plain'});
  response.end('HTTP error ' + status + '\n');
}

function tracesPage(body, response) {
  try {
    var traces = JSON.parse(body);

    if (!traces instanceof Array || traces.length === 0) {
      return errorPage(response, 400);
    }

    mongoClient.connect(dbUrl, function(err, db) {
      assert.equal(null, err);
      saveTraces(traces, db, function () {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end('["Traces saved on server"]');
        db.close();
      });
    });
  } catch (e) {
    errorPage(response, 400);
  }
}

function adminPage(response) {
  mongoClient.connect(dbUrl, function(err, db) {
    assert.equal(null, err);
    fetchTraces(db, function (traces) {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end(adminTemplate({ traces: traces }));
      db.close();
    });
  });
}

function saveTraces(traces, db, callback) {
  var collection = db.collection('traces');
  collection.insert(traces, function(err, result) {
    assert.equal(traces.length, result.length);
    callback(result);
  });
}

function fetchTraces(db, callback) {
  var collection = db.collection('traces');
  collection.find({}).toArray(function(err, traces) {
    assert.equal(err, null);
    callback(traces);
  });
}