const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'yahyadb',
  password: 'America@4895',
  database: 'test1'
})


db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database: ' + err.message);
      return;
    }
    console.log('Connected to the MySQL database');
  });
    
module.exports=db;