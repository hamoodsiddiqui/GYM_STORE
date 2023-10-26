const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const db = require('./db');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const auth = require('./routes/auth');
app.use(express.urlencoded({ extended: false }))
// Middleware to parse JSON requests
app.use(express.json());
app.use(bodyParser.json());
app.set('view engine', 'ejs');
// Set the directory where your EJS templates are located
app.set('views', path.join(__dirname, 'views'));
// app.get('/register', (req, res) => {
//     res.render('register.ejs', { errorMessage: undefined });
// });
const sessionStore = new MySQLStore({
  expiration: 86400000,
  endConnectionOnClose: false,
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data',
    },
  },
  // Use the same database connection as your db module
  database: db.database,
});
const port = 3000;
app.use(session({
  secret: 'vital-signs', // Set a secret key for session data
  //store: sessionStore,
  resave: false,
  saveUninitialized: false,
}));

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});




// Define your routes here
// For example:
app.get('/', (req, res) => {
  res.render('index.ejs');
});
app.get('/supplements', (req, res) => {
  const selectSupplementsQuery = 'SELECT * FROM Supplements';
  db.query(selectSupplementsQuery, (err, supplements) => {
    if (err) {
      console.error('Error fetching supplements:', err);
      res.status(500).json({ error: 'An error occurred while fetching supplements' });
    } else {
      res.render('supplements.ejs', { supplements });
    }
  });
});

app.get('/supplements/add', (req, res) => {
  res.render('add_supplements.ejs');
});
app.post('/supplements/add', (req, res) => {
  const { product_name, description, price, stock_quantity, weight, brand, expiry_date } = req.body;
  const product_type = "Supplements";

  if (product_name && description && price && stock_quantity && brand) {
    // Create a new product
    const productQuery = 'INSERT INTO Products (product_type, product_name, brand, description, price, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(productQuery, [product_type, product_name, brand, description, price, stock_quantity], (err, result) => {
      if (err) {
        console.error('Error creating a new product:', err);
        res.status(500).json({ error: 'An error occurred while creating the product' });
      } else {
        console.log("Product created successfully");
        
        // Now, insert the supplement using the product ID from the inserted product
        const productId = result.insertId;
        
        if (weight && expiry_date) {
          // Create a new supplement
          const supplementQuery = 'INSERT INTO Supplements (product_id, weight, expiry_date) VALUES (?, ?, ?)';
          db.query(supplementQuery, [productId, weight, expiry_date], (err, result) => {
            if (err) {
              console.error('Error creating a new supplement:', err);
              res.status(500).json({ error: 'An error occurred while creating the supplement' });
            } else {
              res.status(201).json({ message: 'Supplement created successfully and Product also created successfully' });
            }
          });
        } else {
          res.status(201).json({ message: 'Product created successfully' });
        }
      }
    });
  } else {
    res.status(400).json({ error: 'Invalid request data' });
  }
});

// // Create a new product or supplement
// app.post('/supplements/add', (req, res) => {
//   const { product_name, description, price, stock_quantity, weight, brand, expiry_date } = req.body;
  
// const product_type="Supplements";
//   if (product_type && product_name && description && price && stock_quantity && brand) {
//     // Create a new product
//     const productQuery = 'INSERT INTO Products (product_type,product_name,brand, description, price, stock_quantity) VALUES (?,?, ?, ?, ?,?)';
//     db.query(productQuery, [product_type,product_name,brand, description, price, stock_quantity], (err, result) => {
//       if (err) {
//         console.error('Error creating a new product:', err);
//        // res.status(500).json({ error: 'An error occurred while creating the product' });
//       } else {
//         console.log("Product created successfully");
//        // res.status(201).json({ message: 'Product created successfully' });
//       }
//     });

//    const productId=result.insertId;
//     if (weight && expiry_date) {
//       // Create a new supplement
//       const supplementQuery = 'INSERT INTO Supplements (productId ,weight, expiry_date) VALUES (?,?,?)';
//       db.query(supplementQuery, [weight, expiry_date], (err, result) => {
//         if (err) {
//           console.error('Error creating a new supplement:', err);
//           res.status(500).json({ error: 'An error occurred while creating the supplement' });
//         } else {
//           res.status(201).json({ message: 'Supplement created successfully/n Product also created successfully' });
//         }
//       });
//     }

//   } 
   
//    else {
//     res.status(400).json({ error: 'Invalid request data' });
//   }
// });

app.use('/', auth);
// app.use((err, req, res, next) => {
//     res.status(404).send('Not Found');
// });



 app.use((req, res) => {
  res.status(404).send('Not Found');
});




