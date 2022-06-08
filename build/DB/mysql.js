var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '13.209.67.44',
  user     : 'centos',
  password : 'art3640#',
  database : 'arterior'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

exports.query = function(queryText){
    var result;
    connection.query(queryText, function (error, results, fields) {
        if (error) throw error;

        console.log("SQL query Success");
        console.log(results);
        console.log(fields);
    });
    return result;
} 
