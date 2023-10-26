const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sql#_erenyeager16',
  database: 'test'
})


db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database: ' + err.message);
      return;
    }
    console.log('Connected to the MySQL database');
  });
    
//   db.query('INSERT INTO user (Fname, Lname, username, passwords, email, address, city, phoneno, roles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', ['hamood', 'sidd', 'hamood', '123', 'aa@gmail.com', '123 Main St', 'New York', '555-1234', 'admin'], (err) => {
//     if (err) {
//         console.error('Error inserting data into the database:', err);
//         return res.status(500).json({ errorMessage: 'Registration failed' });
//     } else {
//         console.log('Success registration');
//         //return res.status(200).json({ message: 'Registration successful' });
//     }
// });


  //db.end();
module.exports=db;