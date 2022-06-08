var DB = require("../DB/mysql.js");
var result = DB.query(`SELECT 'number', 'title', 'text', 'owner', 'time', 'views' FROM 'board' WHERE 1`);

console.log(result);

onload(
    ()=>{console.log(result);}
);


