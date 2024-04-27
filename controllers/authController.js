const db = require("../db"); // Import your database connection

exports.registerUser = (req, res) => {
  // Registration logic here
  const { Fname, Lname, username, passwords, email, address, city, phoneno } =
    req.body;
  db.query(
    "INSERT INTO user (Fname, Lname, username, passwords, email, address, city, phoneno) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [Fname, Lname, username, passwords, email, address, city, phoneno],
    (err, result) => {
      if (err) {
        console.error("Error inserting data into the database:", err);
        res.status(500).json({ errorMessage: "Registration failed" });
      } else {
        console.log("User registered successfully. User ID:", result.insertId);
        // return res.json({ message: 'Registration successful' });
        res.redirect(`http://localhost:3000/`);
      }
    }
  );
};

exports.loginUser = (req, res) => {
  // Login logic here
  const { username, passwords } = req.body;
  const query =
    "SELECT id, roles FROM user WHERE username = ? AND passwords = ?";
  console.log("Request body:", req.body);
  db.query(query, [username, passwords], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length === 1) {
      // User is authenticated; store their ID and role in the session
      req.session.userId = results[0].id;
      req.session.userRole = results[0].roles;
      const userId = req.session.userId;
      console.log(`${username} ${passwords}`);
      console.log(
        `LOGGED IN USER ID: ${userId}, ROLE: ${req.session.userRole}`
      );
      console.log(`${req.session} -- ${req.session.user}`);
      //return res.json({ message: 'Login successful' });
      if (req.session.userRole == "admin")
        res.redirect(`http://localhost:3000/products`);
      else if (req.session.userRole == "customer")
        res.redirect(`http://localhost:3000/`);
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  });
};
