
var express = require('express');
var http = require('http');
var body_parser = require('body-parser');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');

var DB = require("./DB/mysql");

var app = express();
var router = express.Router();

var nofPostPerPage = 10;

// app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: false}));

app.get('/', function(request, response){
    response.sendFile(__dirname+'/public/index.html');
});

app.use(express.static(`public`));

app.get('/board/:dyn', function(request, response){
    makeBoardRes(request.params.dyn, response);
});

app.get('/post/:dyn', function(request, response){
    
});

app.post("/html/write_board.html", function(req, res){
    console.log(req.body);

    var title = req.body.utitle;
    var owner = req.body.uname;
    var text = req.body.utext;

    DB.executeQuery(`INSERT INTO board(title, text, owner, views) VALUES ("${title}","${text}","${owner}", 0)`, (err, rows)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            makeBoardRes(1, res);
        }
    });
});

app.use('/', router);

// app.all('*', function(req, res){//등록되지 않은 패스에 대해 페이지 오류 응답
//     console.log(req);
//     // res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
// })

app.listen(process.env.PORT || 5000, ()=>{
    console.log(`start server`);
});


// functions

function makeBoardRes(page, response)
{
    DB.executeQuery(`SELECT number, title, text, owner, views, date_format(time, '%y/%m/%d %T') as time FROM board`, (err, rows)=>{
        if(!err)
        {
            if(rows.length/10 < page-1)
            {
                return;
            }
            var num = page*nofPostPerPage<rows.length?nofPostPerPage:rows.length%nofPostPerPage;
            var nOfPage = rows.length/nofPostPerPage+1;
            var res =
            `
            <html style="height: 100%">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" href="/css/bootstrap.css">
                
                <script src="/js/jquery-3.6.0.js"></script>
                <script src="/js/bootstrap.js"></script>

                <style>
                    a{
                        text-decoration-line: none;
                    }
                </style>
            </head>
        
            <body>
                <div class="container">
                    <table class="table table-striped">
                        <thead class="thead-dark">
                            <tr>
                                <th style="width: 6%;">No.</th>
                                <th style="width: 48%;">제목</th>
                                <th>작성자</th>
                                <th>조회수</th>
                                <th style="width: 22%">작성일</th>
                            </tr>
                        </thead>
                        <tbody>`;
        
                        for(var i=0; i<num; i++)
                        {
                            res += `
                            <tr>
                                <td>${rows[(page-1)*nofPostPerPage + i].number}</td>
                                <td><a href="/html/read.html" class="text-reset">${rows[(page-1)*nofPostPerPage + i].title}</a></td>
                                <td>${rows[(page-1)*nofPostPerPage + i].owner}</td>
                                <td>${rows[(page-1)*nofPostPerPage + i].views}</td>
                                <td>${rows[(page-1)*nofPostPerPage + i].time}</td>
                            </tr>`;
                        }
                        
                        
            res += `
                        </tbody>
                    </table>
                    <hr />
                    <div class="container">
                        <div class="btn-toolbar row justify-content-md-evenly" role="toolbar" aria-label="Toolbar with button groups">
                            <div class="btn-group mr-2 col-4" role="group" aria-label="First group">
                                <button type="button" class="btn btn-secondary" onclick="location.href='/board/${page<rows.length?(Number(page)-1):1}'">&lt;</button>`;
                                for(var i=1; i<nOfPage; i++)
                                {
                                    if(i==page)
                                    {
                                        res+=`
                                        <button type="button" class="btn btn-secondary active" onclick="location.href='/board/${i}'">${i}</button>
                                        `;
                                    }
                                    else
                                    {
                                        res+=`
                                        <button type="button" class="btn btn-secondary" onclick="location.href='/board/${i}'">${i}</button>
                                        `;
                                    }
                                }
            res+=`
                                <button type="button" class="btn btn-secondary" onclick="location.href='/board/${page<nOfPage?(Number(page)+1):nOfPage}'">&gt;</button>
                            </div>
                        </div>
                        <div class="row justify-content-end" style="margin-top: 10px;">
                            <a class="btn btn-dark col-2" href="/html/write_board.html">글쓰기</a>
                        </div>
                    </div>
        
                </div>
            </body>
            </html>
            `;
        
            response.send(res);
        }
        else
        {
            console.log(err);
        }
    });
}

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