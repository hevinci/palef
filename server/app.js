var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes');
var jsonParser = bodyParser.json();
var app = express();

app.engine('dot', require('./templating'));
app.set('views', __dirname + '/template');
app.set('view engine', 'dot');
app.use('/', express.static(__dirname + './../public'));

app.get('/admin', routes.admin);
app.post('/traces', jsonParser, routes.traces);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send(err.message);
});

app.listen(3000, function () {
  console.log('Application listening on port 3000');
});
