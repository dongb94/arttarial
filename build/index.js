
var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');

var DB = require("./DB/mysql");

var app = express();

app.get('/', function(request, response){
    response.sendFile(__dirname+'/index.html');
});

app.listen(process.env.PORT || 5000, ()=>{
    console.log(`start server`);
});
/*
http.createServer(function (request, response) {

    console.log('request starting for ');
    console.log(request);

    if (request.method == 'POST') {
        var body = '';

        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            var post = qs.parse(body);
            // use post['blah'], etc.
        });
    }

    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';

    console.log(filePath);
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }

    fs.exists(filePath, function(exists) {

        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
   });

   // DB.query(`INSERT INTO 'Test' ('post') VALUES (${request})`);

}).listen(process.env.PORT || 5000);
*/