var DB = require("../DB/mysql");

exports.readTable = function(){
    return DB.query(`SELECT 'number', 'title', 'text', 'owner', 'time', 'views' FROM 'board' WHERE 1`);
}

