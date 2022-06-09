var mysql      = require('mysql');
var pool = mysql.createPool({
  host     : '13.209.67.44',
  user     : 'centos',
  password : 'art3640#',
  database : 'arterior'
});

// connection.connect(function(err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }

//   console.log('connected as id ' + connection.threadId);
// });


exports.executeQuery = function(query, callback) {
  pool.getConnection(function (err, connection) {
    if (err) {
        return callback(err, null);
    }
    else if (connection) {
        connection.query(query, function (err, rows, fields) {
            connection.release();
            if (err) {
                return callback(err, null);
            }
            return callback(null, rows);
        })
    }
    else {
        return callback(true, "No Connection");
    }
  });
}