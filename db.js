require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.SQL_PASSWORD,
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
