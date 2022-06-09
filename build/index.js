
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

function readPost(postNum, response)
{
    DB.executeQuery(`SELECT number, title, text, owner, views, date_format(time, '%Y.%m.%d %T') as time FROM board WHERE number=${postNum}`,  (err, rows)=>{
        
        if(!err)
        {
    
            res = `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                    <!-- Core theme CSS (includes Bootstrap)-->
                    <link href="../css/bootstrap.css" rel="stylesheet" />
                </head>
                <body>
                    <!-- Page content-->
                    <div class="container mt-5">
                        <div class="row">
                            <div class="col-lg-8">
                                <!-- Post content-->
                                <article>
                                    <!-- Post header-->
                                    <header class="mb-4">
                                        <!-- Post title-->
                                        <h1 class="fw-bolder mb-1">${rows[0].title}</h1>
                                        <!-- Post meta content-->
                                        <div class="text-muted fst-italic mb-2">
                                            ${rows[0].owner}
                                            <p class="float-end">${rows[0].time} 조회수 : ${rows[0].views}</p>
                                        </div>
                                        <!-- Post categories
                                        <a class="badge bg-secondary text-decoration-none link-light" href="#!">Web Design</a>
                                        <a class="badge bg-secondary text-decoration-none link-light" href="#!">Freebies</a>
                                        -->
                                    </header>
                                    <hr/>
                                    <!-- Post content-->
                                    <section class="mb-5">
                                        ${rows[0].text}
                                    </section>
            
                                    <div class="mb-5 justify-content-end">
                                        <button class="btn btn-dark" style="margin-left: 90%;">목록</button>
                                    </div>
                                </article>
                                <!-- Comments section-->
                                <section class="mb-5">
                                    <div class="card bg-light">
                                        <div class="card-body">
                                            <!-- Comment form-->
                                            <form class="mb-4"><textarea class="form-control" rows="3" placeholder="Join the discussion and leave a comment!"></textarea></form>
                                            <!-- Comment with nested comments-->
                                            <div class="d-flex mb-4">
                                                <!-- Parent comment-->
                                                <div class="flex-shrink-0"><img class="rounded-circle" src="https://dummyimage.com/50x50/ced4da/6c757d.jpg" alt="..." /></div>
                                                <div class="ms-3">
                                                    <div class="fw-bold">Commenter Name</div>
                                                    If you're going to lead a space frontier, it has to be government; it'll never be private enterprise. Because the space frontier is dangerous, and it's expensive, and it has unquantified risks.
                                                    <!-- Child comment 1-->
                                                    <div class="d-flex mt-4">
                                                        <div class="flex-shrink-0"><img class="rounded-circle" src="https://dummyimage.com/50x50/ced4da/6c757d.jpg" alt="..." /></div>
                                                        <div class="ms-3">
                                                            <div class="fw-bold">Commenter Name</div>
                                                            And under those conditions, you cannot establish a capital-market evaluation of that enterprise. You can't get investors.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- Single comment-->
                                            <div class="d-flex">
                                                <div class="flex-shrink-0"><img class="rounded-circle" src="https://dummyimage.com/50x50/ced4da/6c757d.jpg" alt="..." /></div>
                                                <div class="ms-3">
                                                    <div class="fw-bold">Commenter Name</div>
                                                    When I look at the universe and all the ways the universe wants to kill us, I find it hard to reconcile that with statements of beneficence.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
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