var fs            = require('fs'),
    express       = require('express');

var app = express.createServer();

app.listen(80);


app.use(express.static(__dirname + '/public'));



