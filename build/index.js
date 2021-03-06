
var express = require('express');
var http = require('http');
var body_parser = require('body-parser');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');

var DB = require("./DB/mysql");
const { response } = require('express');

var app = express();
var router = express.Router();

var nofPostPerPage = 10;

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: false}));
app.use(express.static(`public`));

app.get('/', function(request, response){
    response.sendFile(__dirname+'/public/index.html');
});


app.get('/board/:dyn', function(request, response){
    makeBoardRes(request.params.dyn, response);
});

app.get('/post/:page/:postNum', function(request, response){
    console.log(`request Post Page ${request.params.page}:${request.params.postNum}`);
    readPost(request.params.page, request.params.postNum, response);
});

app.post("/post/:page", function(req, res){

    console.log(req.body);
    
    var type = req.body.ureqType;
    var post = req.body.upost;
    var passwd = req.body.upasswd;

    // console.log(`request post Page ${req.params.page}\n\ttype:${type}\n\tpostNum:${post}\n\tpasswd:${passwd}`);

    DB.executeQuery(`SELECT passwd FROM board WHERE number=${post}`, (err, rows)=>{
        if(!err)
        {
            console.log(rows);
            if(rows.length != 1 || rows[0].passwd != passwd)
            {
                res.send(`<script>alert("잘못된 비밀번호 입니다.");</script>`);
                return;
            }

            if(type==1) // delete
            {
                DB.executeQuery(`DELETE FROM board WHERE number=${post}`, (err, rows)=>{
                    if(err)
                    {
                        console.log(err);
                    }
                });
            }
            else
            {
                res.redirect(`/html/fix_board.html/${post}`);
            }
        }
        else
        {
            console.log(err);
        }
    });


});

app.post("/html/write_board.html", function(req, res){
    // console.log(req.body);

    console.log(`Write Post [${req.params.postNum}]`);

    var title = req.body.utitle;
    var owner = req.body.uname;
    var text = req.body.utext;
    var passwd = req.body.upasswd;

    let replcae = text.replace(/\n/g,'<br>');

    DB.executeQuery(`INSERT INTO board(title, text, owner, views, passwd) VALUES ("${title}","${replcae}","${owner}", 0, "${passwd}")`, (err, rows)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.redirect(`/board/1`);
            // makeBoardRes(1, res);
        }
    });
});

app.get("/html/fix_board.html/:postNum", function(req, res){
    var postNum = req.params.postNum;
    var passwd = req.params.passwd;

    DB.executeQuery(`SELECT title, text, owner, passwd FROM board WHERE number=${postNum}`, (err, rows)=>{
        if(!err)
        {
            console.log(rows);
            
            res.sendFile(__dirname+'/public/html/fix_board.html');
        }
        else
        {
            console.log(err);
        }
    });
});

app.post("/html/fix_board.html/:postNum", function(req, res){

    console.log(`Update Post [${req.params.postNum}]`);

    var title = req.body.utitle;
    var owner = req.body.uname;
    var text = req.body.utext;
    var passwd = req.body.upasswd;

    let replcae = text.replace(/\n/g,'<br>');

    DB.executeQuery(`Update board SET title = "${title}", text = "${replcae}", owner = "${owner}", passwd="${passwd}" WHERE number="${req.params.postNum}"`, (err, rows)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.redirect(`/board/1`);
            //makeBoardRes(1, res);
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
            var num = page*nofPostPerPage<=rows.length?nofPostPerPage:rows.length%nofPostPerPage;
            var nOfPage = ((rows.length-1)/nofPostPerPage)+1;
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
                <div class="container" style="max-width:100%;">
                    <h1>게시판</h1>
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
                                <td><a href="/post/${page}/${rows[(page-1)*nofPostPerPage + i].number}" class="text-reset">${rows[(page-1)*nofPostPerPage + i].title}</a></td>
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
                                <button type="button" class="btn btn-secondary" onclick="location.href='/board/${page>1?(Number(page)-1):1}'">&lt;</button>`;
                                for(var i=1; i<=nOfPage; i++)
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

function readPost(page, postNum, response)
{
    DB.executeQuery(`SELECT title, text, owner, views, date_format(time, '%Y.%m.%d %T') as time FROM board WHERE number=${postNum}`,  (err, rows)=>{
        
        if(!err)
        {
            if(rows.length==0)
            {
                makeBoardRes(page, response);
                return;
            }

            DB.executeQuery(`Update board SET views=${Number(rows[0].views)+1} WHERE number=${postNum}`, (err, rows)=>{
                if(err)
                {
                    console.log(err);
                }
            });
            res = `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                    <!-- Core theme CSS (includes Bootstrap)-->
                    <link href="/css/bootstrap.css" rel="stylesheet" />
                    <script>
                        function showPopUp()
                        {
                            window.open("/html/fix_popup.html/${postNum}", "a", "width=400, height=300, left=100, top=50");
                        }
                    </script>

                    <script>

                        function sendPost(type){
                            var passwd = document.getElementsByName('passwd')[0].value;
                            var xhr = new XMLHttpRequest();
                            xhr.open("POST", "/post/${page}", true);
                            xhr.setRequestHeader('Content-Type', 'application/json');
                            xhr.send(JSON.stringify({
                                ureqType: type,
                                upasswd: passwd,
                                upost: ${postNum}
                            }));
                        }
                    </script>
                </head>
                <body>
                    <!-- Page content-->
                    <div class="container">
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
                                    <hr/>
                                    <div class="mb-5 justify-content-end" style="">
                                        <input type="password" placeholder="password" style="margin-left: 40%;" name="passwd">
                                        <button class="btn btn-danger" style="margin-left: 2%;" onclick="sendPost(1); location.href='/board/${page}';">삭제</button>
                                        <button class="btn btn-dark" style="margin-left: 2%;" onclick="sendPost(2); location.href='/html/fix_board.html/${postNum}';">수정</button>
                                        <button class="btn btn-dark" style="margin-left: 2%;" onclick="location.href='/board/${page}';">목록</button>
                                    </div>
                                </article>
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

function fixPopUp(postNum, res)
{
    let popup = 
    `
    <html>
        <head>
            <title>비밀번호 확인</title>
            <script language="javascript">
                function moveClose() {
                    var form = document.frmSubmit;
                    var passwd = form.passwd.value;
                    window.opener.location.href="/html/fix_board.html/${postNum}/"+passwd;
                    self.close();
                }
            </script>
        </head>
        <body>
            <form name=frmSubmit>
                비밀번호
                <input type="password" name="passwd" id="passwd">
                <button type="button" onclick="moveClose();">확인</button>
            </form>
        </body>
    </html>
    `

    res.send(popup);
}
