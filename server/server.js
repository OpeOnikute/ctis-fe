var gzippo = require('gzippo');
var express = require('express');
var logger = require('morgan');
var path = require('path');
var app = express();

var port = process.env.PORT || 5000;

app.use(logger('dev'));
app.use(gzippo.staticGzip(__dirname + "/../app"));

app.use(function(req, res) {
    res.sendfile(path.resolve(__dirname + "/../app/index.html"));
});

app.listen(port);
console.log('Listening on port: ' + port);