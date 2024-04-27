const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "RazanaqviMySQL1@",
  database: "test",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: " + err.message);
    return;
  }
  console.log("Connected to the MySQL database");
});

module.exports = db;
