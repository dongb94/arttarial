
var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');

var DB = require("./DB/mysql");

var app = express();

app.get('/', function(request, response){
    response.sendFile(__dirname+'/public/index.html');
});

app.get('/html/board.html', function(request, response){
    result = DB.query(`SELECT 'number', 'title', 'text', 'owner', 'time', 'views' FROM board WHERE 1`);
    console.log(result);
    var res =
    `
    <html style="height: 100%">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="/css/bootstrap.css">
        
        <script src="/js/jquery-3.6.0.js"></script>
        <script src="/js/bootstrap.js"></script>
    </head>

    <body>
        <div class="container">
            <table class="table table-striped">
                <thead class="thead-dark">
                    <tr>
                        <th style="width: 10%;">번호</th>
                        <th style="width: 50%;">제목</th>
                        <th>작성자</th>
                        <th>조회수</th>
                        <th>날짜</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>22</td>
                        <td><a href="read.php" class="text-reset">2235252353</a></td>
                        <td>관리자</td>
                        <td>2021-01-02</td>
                        <td>20</td>
                    </tr>
                </tbody>
            </table>
            <hr />
            <div class="container">
                <div class="btn-toolbar row justify-content-md-evenly" role="toolbar" aria-label="Toolbar with button groups">
                    <div class="btn-group mr-2 col-4" role="group" aria-label="First group">
                        <button type="button" class="btn btn-secondary">&lt;</button>
                        <button type="button" class="btn btn-secondary">1</button>
                        <button type="button" class="btn btn-secondary">2</button>
                        <button type="button" class="btn btn-secondary">3</button>
                        <button type="button" class="btn btn-secondary">4</button>
                        <button type="button" class="btn btn-secondary">5</button>
                        <button type="button" class="btn btn-secondary">&gt;</button>
                    </div>
                </div>
                <div class="row justify-content-end" style="margin-top: 10px;">
                    <a class="btn btn-dark col-2" href="./write_board.html">글쓰기</a>
                </div>
            </div>

        </div>
    </body>
    </html>
    `;

    response.send(res);
});

app.use(express.static(`public`));

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