var express = require('express');
var path  = require('path');

var app = express();

var port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'app')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../app/index.html')); // load the single view file (angular will handle the page changes on the front-end)
});

app.listen(port);
console.log("App listening on port: " + port);