var DB = require("../DB/mysql");

console.log(result);

onload(
    ()=>{console.log(result);}
);


exports.readTable = function(){
    return DB.query(`SELECT 'number', 'title', 'text', 'owner', 'time', 'views' FROM 'board' WHERE 1`);
}

