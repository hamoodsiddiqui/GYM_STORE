const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const db = require("./db");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const auth = require("./routes/auth");
const methodOverride = require("method-override");
const multer = require("multer");
const fs = require("fs");
// Add this middleware to serve static files
app.use(express.static("public"));
//app.use(express.static('dist'));
app.use(express.static("views"));
app.use(express.static("public", { maxAge: 0 }));

const uploadDirectory = "public/uploads";
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: false }));
// Middleware to parse JSON requests
app.use(express.json());
app.use(bodyParser.json());
app.set("view engine", "ejs");
// Set the directory where your EJS templates are located
app.set("views", path.join(__dirname, "views"));
// app.get('/register', (req, res) => {
//     res.render('register.ejs', { errorMessage: undefined });
// });
const sessionStore = new MySQLStore({
  expiration: 86400000,
  endConnectionOnClose: false,
  createDatabaseTable: true,
  schema: {
    tableName: "sessions",
    columnNames: {
      session_id: "session_id",
      expires: "expires",
      data: "data",
    },
  },
  // Use the same database connection as your db module
  database: db.database,
});
const port = 3000;
app.use(
  session({
    secret: "vital-signs", // Set a secret key for session data
    //store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
app.use(express.static("views"));
//app.set('views', path.join(__dirname, 'views'));
//app.use(express.static('views'));
//app.use(express.static('dist'));
//app.set('dist', path.join(__dirname, 'dist'));
//const distPath = path.join(__dirname, 'dist');
//console.log('Dist Path:', distPath); // Check the path

//app.use(express.static(distPath));
// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename to avoid overwriting
  },
});

// Create Multer instance
const upload = multer({ storage: storage });

const checkUserRole = (requiredRole) => {
  return (req, res, next) => {
    // Check if user is authenticated and has a role
    if (req.session.userRole) {
      const userRole = req.session.userRole;
      console.log(`The user id: ${req.session.userId} role is ${userRole}`);
      // Check if the user has the required role
      if (userRole === requiredRole) {
        // User has the required role, proceed to the next middleware or route handler
        next();
      } else {
        // User does not have the required role, send an unauthorized response
        res.status(403).json({ error: "Unauthorized" });
      }
    } else {
      // User is not authenticated, send a forbidden response
      res.status(403).json({ error: "Forbidden" });
    }
  };
};
const checkAdmin = checkUserRole("admin");
const checkCustomer = checkUserRole("customer");
// Define your routes here
// For example:
// app.get('/', (req, res) => {
//   res.render('index-2.ejs');
// });

app.get("/products", checkAdmin, (req, res) => {
  res.render("products"); // Assuming you've set up your view engine (like EJS)
});
app.get("/customer/products", (req, res) => {
  res.render("customer_products"); // Assuming you've set up your view engine (like EJS)
});

app.get("/merchandise", checkAdmin, (req, res) => {
  const selectMerchandiseQuery = "SELECT * FROM Merchandise";
  db.query(selectMerchandiseQuery, (err, merchandise) => {
    if (err) {
      console.error("Error fetching merchandise:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching merchandise" });
    } else {
      // Now, run another query to fetch products with product_type = "Merchandise"
      const selectProductsQuery =
        "SELECT * FROM Products WHERE product_type = ?";
      db.query(selectProductsQuery, ["Merchandise"], (err, products) => {
        if (err) {
          console.error("Error fetching products:", err);
          res
            .status(500)
            .json({ error: "An error occurred while fetching products" });
        } else {
          // Combine data from both tables
          const combinedData = merchandise.map((merchandiseItem) => {
            const matchingProduct = products.find(
              (product) => product.product_id === merchandiseItem.product_id
            );
            return { ...merchandiseItem, ...matchingProduct };
          });

          // Render your 'merchandise.ejs' template with the combined data
          res.render("merchandise.ejs", { data: combinedData });
        }
      });
    }
  });
});

app.get("/supplements", checkAdmin, (req, res) => {
  const selectSupplementsQuery = "SELECT * FROM Supplements";
  db.query(selectSupplementsQuery, (err, supplements) => {
    if (err) {
      console.error("Error fetching supplements:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching supplements" });
    } else {
      // Now, run another query to fetch products with product_type = "Supplements"
      const selectProductsQuery =
        "SELECT * FROM Products WHERE product_type = ?";
      db.query(selectProductsQuery, ["Supplements"], (err, products) => {
        if (err) {
          console.error("Error fetching products:", err);
          res
            .status(500)
            .json({ error: "An error occurred while fetching products" });
        } else {
          // Combine data from both tables
          const combinedData = supplements.map((supplement) => {
            const matchingProduct = products.find(
              (product) => product.product_id === supplement.product_id
            );
            return { ...supplement, ...matchingProduct };
          });

          // Render your 'supplements.ejs' template with the combined data
          res.render("supplements.ejs", { data: combinedData });
        }
      });
    }
  });
});
app.get("/gymequipment", checkAdmin, (req, res) => {
  const selectGymEquipmentQuery = "SELECT * FROM GymEquipment";
  db.query(selectGymEquipmentQuery, (err, gymEquipment) => {
    if (err) {
      console.error("Error fetching gym equipment:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching gym equipment" });
    } else {
      // Now, run another query to fetch products with product_type = "Gym Equipment"
      const selectProductsQuery =
        "SELECT * FROM Products WHERE product_type = ?";
      db.query(selectProductsQuery, ["Gym Equipment"], (err, products) => {
        if (err) {
          console.error("Error fetching products:", err);
          res
            .status(500)
            .json({ error: "An error occurred while fetching products" });
        } else {
          // Combine data from both tables
          const combinedData = gymEquipment.map((equipment) => {
            const matchingProduct = products.find(
              (product) => product.product_id === equipment.product_id
            );
            return { ...equipment, ...matchingProduct };
          });

          // Render your 'gymequipment.ejs' template with the combined data
          res.render("gymequipment.ejs", { data: combinedData });
        }
      });
    }
  });
});

app.get("/supplements/details/:productId", (req, res) => {
  const productId = req.params.productId;

  // Fetch data for the product with the given productId from both tables
  // Combine data from both tables as needed
  const selectSupplementQuery =
    "SELECT * FROM Supplements WHERE product_id = ?";
  const selectProductQuery = "SELECT * FROM Products WHERE product_id = ?";

  db.query(selectSupplementQuery, [productId], (err, supplementData) => {
    if (err) {
      console.error("Error fetching supplement data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching supplement data" });
    }

    db.query(selectProductQuery, [productId], (err, productData) => {
      if (err) {
        console.error("Error fetching product data:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching product data" });
      }

      // Combine data from both tables as needed
      const combinedData = supplementData.map((supplement) => {
        const matchingProduct = productData.find(
          (product) => product.product_id === supplement.product_id
        );
        return { ...supplement, ...matchingProduct };
      });

      // Render your 'details.ejs' template with the combined data
      res.render("supplements_details.ejs", { data: combinedData[0] }); // Assuming only one row is returned
    });
  });
});
app.get("/gymequipment/details/:productId", (req, res) => {
  const productId = req.params.productId;

  // Fetch data for the gym equipment with the given productId from both tables
  // Combine data from both tables as needed
  const selectGymEquipmentQuery =
    "SELECT * FROM GymEquipment WHERE product_id = ?";
  const selectProductQuery = "SELECT * FROM Products WHERE product_id = ?";

  db.query(selectGymEquipmentQuery, [productId], (err, gymEquipmentData) => {
    if (err) {
      console.error("Error fetching gym equipment data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching gym equipment data" });
    }

    db.query(selectProductQuery, [productId], (err, productData) => {
      if (err) {
        console.error("Error fetching product data:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching product data" });
      }

      // Combine data from both tables as needed
      const combinedData = gymEquipmentData.map((equipment) => {
        const matchingProduct = productData.find(
          (product) => product.product_id === equipment.product_id
        );
        return { ...equipment, ...matchingProduct };
      });

      // Render your 'gymequipment_details.ejs' template with the combined data
      res.render("gymequipment_details.ejs", { data: combinedData[0] }); // Assuming only one row is returned
    });
  });
});
app.get("/merchandise/details/:productId", (req, res) => {
  const productId = req.params.productId;

  // Fetch data for the merchandise with the given productId from both tables
  // Combine data from both tables as needed
  const selectMerchandiseQuery =
    "SELECT * FROM Merchandise WHERE product_id = ?";
  const selectProductQuery = "SELECT * FROM Products WHERE product_id = ?";

  db.query(selectMerchandiseQuery, [productId], (err, merchandiseData) => {
    if (err) {
      console.error("Error fetching merchandise data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching merchandise data" });
    }

    db.query(selectProductQuery, [productId], (err, productData) => {
      if (err) {
        console.error("Error fetching product data:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching product data" });
      }

      // Combine data from both tables as needed
      const combinedData = merchandiseData.map((merchItem) => {
        const matchingProduct = productData.find(
          (product) => product.product_id === merchItem.product_id
        );
        return { ...merchItem, ...matchingProduct };
      });

      // Render your 'merchandise_details.ejs' template with the combined data
      res.render("merchandise_details.ejs", { merchandise: combinedData[0] }); // Assuming only one row is returned
    });
  });
});

app.get("/merchandise/add", checkAdmin, (req, res) => {
  // Render your 'gymequipment.ejs' template with the combined data
  res.render("add_merchandise.ejs");
});
app.get("/gymequipment/add", checkAdmin, (req, res) => {
  // Render your 'gymequipment.ejs' template with the combined data
  res.render("add_gymequipment.ejs");
});

app.get("/customer/gymequipment", (req, res) => {
  const selectGymEquipmentQuery = "SELECT * FROM GymEquipment";
  db.query(selectGymEquipmentQuery, (err, gymEquipment) => {
    if (err) {
      console.error("Error fetching gym equipment:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching gym equipment" });
    } else {
      // Now, run another query to fetch products with product_type = "Gym Equipment"
      const selectProductsQuery =
        "SELECT * FROM Products WHERE product_type = ?";
      db.query(selectProductsQuery, ["Gym Equipment"], (err, products) => {
        if (err) {
          console.error("Error fetching products:", err);
          res
            .status(500)
            .json({ error: "An error occurred while fetching products" });
        } else {
          // Combine data from both tables
          const combinedData = gymEquipment.map((equipment) => {
            const matchingProduct = products.find(
              (product) => product.product_id === equipment.product_id
            );
            return { ...equipment, ...matchingProduct };
          });

          // Render your 'customer_gymequipment.ejs' template with the combined data
          res.render("customer_gymequipment.ejs", { data: combinedData });
        }
      });
    }
  });
});
app.get("/customer/merchandise", (req, res) => {
  // Fetch all merchandise items
  const selectMerchandiseQuery = "SELECT * FROM Merchandise";
  db.query(selectMerchandiseQuery, (err, merchandise) => {
    if (err) {
      console.error("Error fetching merchandise:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching merchandise" });
    } else {
      // Now, run another query to fetch products with product_type = "Merchandise"
      const selectProductsQuery =
        "SELECT * FROM Products WHERE product_type = ?";
      db.query(selectProductsQuery, ["Merchandise"], (err, products) => {
        if (err) {
          console.error("Error fetching products:", err);
          res
            .status(500)
            .json({ error: "An error occurred while fetching products" });
        } else {
          // Combine data from both tables
          const combinedData = merchandise.map((merchItem) => {
            const matchingProduct = products.find(
              (product) => product.product_id === merchItem.product_id
            );
            return { ...merchItem, ...matchingProduct };
          });

          // Render your 'customer_merchandise.ejs' template with the combined data
          res.render("customer_merchandise.ejs", { data: combinedData });
        }
      });
    }
  });
});

app.get("/customer/supplements", (req, res) => {
  const selectSupplementsQuery = "SELECT * FROM Supplements";
  db.query(selectSupplementsQuery, (err, supplements) => {
    if (err) {
      console.error("Error fetching supplements:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching supplements" });
    } else {
      // Now, run another query to fetch products with product_type = "Supplements"
      const selectProductsQuery =
        "SELECT * FROM Products WHERE product_type = ?";
      db.query(selectProductsQuery, ["Supplements"], (err, products) => {
        if (err) {
          console.error("Error fetching products:", err);
          res
            .status(500)
            .json({ error: "An error occurred while fetching products" });
        } else {
          // Combine data from both tables
          const combinedData = supplements.map((supplement) => {
            const matchingProduct = products.find(
              (product) => product.product_id === supplement.product_id
            );
            return { ...supplement, ...matchingProduct };
          });

          // Render your 'supplements.ejs' template with the combined data
          res.render("customer_supplements.ejs", { data: combinedData });
        }
      });
    }
  });
});
app.get("/checkout", (req, res) => {
  const userId = req.session.userId; // Assuming you store user ID in session during login

  // Fetch cart items and calculate the total amount based on product prices and quantities
  const selectCartItemsQuery = `
    SELECT Products.*, CartItems.quantity
    FROM CartItems
    JOIN Products ON CartItems.product_id = Products.product_id
    JOIN Cart ON CartItems.cart_id = Cart.cart_id
    WHERE Cart.customer_id = ?
  `;

  db.query(selectCartItemsQuery, [userId], (err, cartItems) => {
    if (err) {
      console.error("Error fetching cart items:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching cart items" });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Render your 'checkout.ejs' template with the fetched cart items and total amount
    res.render("checkout.ejs", { cartItems, totalAmount });
  });
});

// app.post('/cart/delete', (req, res) => {
//   const userId = req.session.userId; // Assuming you store user ID in session during login

//   // Check if the cart exists for the user
//   const selectCartQuery = 'SELECT * FROM Cart WHERE customer_id = ?';

//   db.query(selectCartQuery, [userId], (err, cartData) => {
//     if (err) {
//       console.error('Error checking cart:', err);
//       return res.status(500).json({ error: 'An error occurred while checking cart' });
//     }

//     if (cartData.length === 0) {
//       return res.status(404).json({ error: 'Cart not found' });
//     }

//     const cartId = cartData[0].cart_id;

//     // Delete all items from the cart
//     const deleteCartItemsQuery = 'DELETE FROM CartItems WHERE cart_id = ?';

//     db.query(deleteCartItemsQuery, [cartId], (err) => {
//       if (err) {
//         console.error('Error deleting cart items:', err);
//         return res.status(500).json({ error: 'An error occurred while deleting cart items' });
//       }

//       return res.json({ message: 'Cart deleted successfully' });
//     });
//   });
// });
app.post("/cart/delete", (req, res) => {
  const userId = req.session.userId; // Assuming you store user ID in session during login

  // Check if the cart exists for the user
  const selectCartQuery = "SELECT * FROM Cart WHERE customer_id = ?";

  db.query(selectCartQuery, [userId], (err, cartData) => {
    if (err) {
      console.error("Error checking cart:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while checking cart" });
    }

    if (cartData.length === 0) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const cartId = cartData[0].cart_id;

    // Delete all items from the cart
    const deleteCartItemsQuery = "DELETE FROM CartItems WHERE cart_id = ?";

    db.query(deleteCartItemsQuery, [cartId], (err) => {
      if (err) {
        console.error("Error deleting cart items:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while deleting cart items" });
      }

      // Delete the cart itself
      const deleteCartQuery = "DELETE FROM Cart WHERE cart_id = ?";

      db.query(deleteCartQuery, [cartId], (err) => {
        if (err) {
          console.error("Error deleting cart:", err);
          return res
            .status(500)
            .json({ error: "An error occurred while deleting cart" });
        }

        //return res.json({ message: 'Cart and cart items deleted successfully' });
        res.redirect(`http://localhost:3000/cart`);
      });
    });
  });
});

// Add this route at the end of your app.js file
app.get("/cart", (req, res) => {
  const userId = req.session.userId; // Assuming you store user ID in session during login

  // Fetch cart items based on the user ID
  const selectCartItemsQuery = `
    SELECT Products.*, CartItems.quantity
    FROM CartItems
    JOIN Products ON CartItems.product_id = Products.product_id
    JOIN Cart ON CartItems.cart_id = Cart.cart_id
    WHERE Cart.customer_id = ?
  `;

  db.query(selectCartItemsQuery, [userId], (err, cartItems) => {
    if (err) {
      console.error("Error fetching cart items:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching cart items" });
    } else {
      // Render your 'cart.ejs' template with the fetched cart items
      res.render("cart.ejs", { cartItems: cartItems });
    }
  });
});

app.get("/supplements/add", checkAdmin, (req, res) => {
  res.render("add_supplements.ejs");
});
//  app.get('/supplements/update', (req, res) => {
//    res.render('update_supplements.ejs');
//  });
app.get("/supplements/update/:product_id", checkAdmin, (req, res) => {
  const product_id = req.params.product_id; // You can get the product_id from the request, possibly as a query parameter
  console.log(`${product_id}`);
  req.session.product_id = product_id;
  res.render("update_supplements.ejs", { product_id: product_id });
});
app.get("/gymequipment/update/:product_id", checkAdmin, (req, res) => {
  const product_id = req.params.product_id;
  console.log(`${product_id}`);
  req.session.product_id = product_id;
  res.render("update_gymequipment.ejs", { product_id: product_id });
});
app.get("/merchandise/update/:product_id", checkAdmin, (req, res) => {
  const product_id = req.params.product_id; // You can get the product_id from the request, possibly as a query parameter
  console.log(`${product_id}`);
  req.session.product_id = product_id;
  res.render("update_merchandise.ejs", { product_id: product_id });
});
app.post("/gymequipment/add", upload.single("image"), (req, res) => {
  const {
    product_name,
    description,
    price,
    stock_quantity,
    brand,
    material,
    weight,
  } = req.body;
  const product_type = "Gym Equipment";

  // Check if an image was uploaded
  const imageurl = req.file ? "uploads/" + req.file.filename : null;

  if (
    product_name &&
    description &&
    price &&
    stock_quantity &&
    brand &&
    material &&
    weight
  ) {
    // Create a new product
    const productQuery =
      "INSERT INTO Products (product_type, product_name, brand, description, imageurl, price, stock_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(
      productQuery,
      [
        product_type,
        product_name,
        brand,
        description,
        imageurl,
        price,
        stock_quantity,
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating a new product:", err);
          res
            .status(500)
            .json({ error: "An error occurred while creating the product" });
        } else {
          console.log("Product created successfully");

          // Now, insert the gym equipment using the product ID from the inserted product
          const productId = result.insertId;

          // Create a new gym equipment
          const gymEquipmentQuery =
            "INSERT INTO GymEquipment (product_id, material, weight) VALUES (?, ?, ?)";
          db.query(
            gymEquipmentQuery,
            [productId, material, weight],
            (err, result) => {
              if (err) {
                console.error("Error creating new gym equipment:", err);
                res
                  .status(500)
                  .json({
                    error: "An error occurred while creating the gym equipment",
                  });
              } else {
                res.redirect(`http://localhost:3000/gymequipment`);
                //res.status(201).json({ message: 'Gym equipment created successfully and Product also created successfully' });
              }
            }
          );
        }
      }
    );
  } else {
    res.status(400).json({ error: "Invalid request data" });
  }
});

app.post("/supplements/add", upload.single("image"), (req, res) => {
  const {
    product_name,
    description,
    price,
    stock_quantity,
    weight,
    brand,
    expiry_date,
  } = req.body;
  const product_type = "Supplements";

  // Check if an image was uploaded
  const imageurl = req.file ? "uploads/" + req.file.filename : null;

  if (product_name && description && price && stock_quantity && brand) {
    // Create a new product
    const productQuery =
      "INSERT INTO Products (product_type, product_name, brand, description,imageurl, price, stock_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(
      productQuery,
      [
        product_type,
        product_name,
        brand,
        description,
        imageurl,
        price,
        stock_quantity,
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating a new product:", err);
          res
            .status(500)
            .json({ error: "An error occurred while creating the product" });
        } else {
          console.log("Product created successfully");

          // Now, insert the supplement using the product ID from the inserted product
          const productId = result.insertId;

          if (weight && expiry_date) {
            // Create a new supplement
            const supplementQuery =
              "INSERT INTO Supplements (product_id, weight, expiry_date) VALUES (?, ?, ?)";
            db.query(
              supplementQuery,
              [productId, weight, expiry_date],
              (err, result) => {
                if (err) {
                  console.error("Error creating a new supplement:", err);
                  res
                    .status(500)
                    .json({
                      error: "An error occurred while creating the supplement",
                    });
                } else {
                  res.redirect(`http://localhost:3000/supplements`);
                  // res.status(201).json({ message: 'Supplement created successfully and Product also created successfully' });
                }
              }
            );
          } else {
            //res.redirect(`http://localhost:3000/supplements`)
            res.status(201).json({ message: "Product created successfully" });
          }
        }
      }
    );
  } else {
    res.status(400).json({ error: "Invalid request data" });
  }
});
app.post("/merchandise/add", upload.single("image"), (req, res) => {
  const {
    product_name,
    description,
    price,
    stock_quantity,
    brand,
    size,
    color,
  } = req.body;
  const product_type = "Merchandise";

  // Check if an image was uploaded
  const imageurl = req.file ? "uploads/" + req.file.filename : null;

  if (
    product_name &&
    description &&
    price &&
    brand &&
    stock_quantity &&
    size &&
    color
  ) {
    // Create a new product
    const productQuery =
      "INSERT INTO Products (product_type, product_name,brand, description, price, stock_quantity, imageurl) VALUES (?, ?,?,?, ?, ?, ?)";
    db.query(
      productQuery,
      [
        product_type,
        product_name,
        brand,
        description,
        price,
        stock_quantity,
        imageurl,
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating a new product:", err);
          res
            .status(500)
            .json({ error: "An error occurred while creating the product" });
        } else {
          console.log("Product created successfully");

          // Now, insert the merchandise details using the product ID from the inserted product
          const productId = result.insertId;

          // Create a new merchandise
          const merchandiseQuery =
            "INSERT INTO Merchandise (product_id, size, color) VALUES (?, ?, ?)";
          db.query(
            merchandiseQuery,
            [productId, size, color],
            (err, result) => {
              if (err) {
                console.error("Error creating new merchandise:", err);
                res
                  .status(500)
                  .json({
                    error: "An error occurred while creating the merchandise",
                  });
              } else {
                res.redirect(`http://localhost:3000/merchandise`);
                // res.status(201).json({ message: 'Merchandise created successfully and Product also created successfully' });
              }
            }
          );
        }
      }
    );
  } else {
    res.status(400).json({ error: "Invalid request data" });
  }
});

// Add a new route to handle delete requests
app.post("/supplements/delete/:product_id", (req, res) => {
  const product_id = req.params.product_id;

  //delete the supplement
  const deleteSupplementQuery = "DELETE FROM Supplements WHERE product_id = ?";
  db.query(deleteSupplementQuery, [product_id], (err, supplementResult) => {
    if (err) {
      console.error("Error deleting supplement:", err);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the supplement" });
    } else {
      //delete the product
      const deleteProductQuery = "DELETE FROM Products WHERE product_id = ?";
      db.query(deleteProductQuery, [product_id], (err, productResult) => {
        if (err) {
          console.error("Error deleting product:", err);
          res
            .status(500)
            .json({ error: "An error occurred while deleting the product" });
        } else {
          console.log(
            `Product with ID ${product_id} and its supplement deleted successfully`
          );
          //res.status(200).json({ message: 'Product and supplement deleted successfully' });
          res.redirect(`http://localhost:3000/supplements`);
        }
      });
    }
  });
});
app.post("/merchandise/delete/:product_id", (req, res) => {
  const product_id = req.params.product_id;

  // Delete the merchandise
  const deleteMerchandiseQuery = "DELETE FROM Merchandise WHERE product_id = ?";
  db.query(deleteMerchandiseQuery, [product_id], (err, merchandiseResult) => {
    if (err) {
      console.error("Error deleting merchandise:", err);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the merchandise" });
    } else {
      // Delete the product
      const deleteProductQuery = "DELETE FROM Products WHERE product_id = ?";
      db.query(deleteProductQuery, [product_id], (err, productResult) => {
        if (err) {
          console.error("Error deleting product:", err);
          res
            .status(500)
            .json({ error: "An error occurred while deleting the product" });
        } else {
          console.log(
            `Product with ID ${product_id} and its merchandise deleted successfully`
          );
          //res.status(200).json({ message: 'Product and merchandise deleted successfully' });
          res.redirect(`http://localhost:3000/merchandise`);
        }
      });
    }
  });
});

app.post("/gymequipment/delete/:product_id", (req, res) => {
  const product_id = req.params.product_id;

  // Delete the gym equipment
  const deleteGymEquipmentQuery =
    "DELETE FROM GymEquipment WHERE product_id = ?";
  db.query(deleteGymEquipmentQuery, [product_id], (err, gymEquipmentResult) => {
    if (err) {
      console.error("Error deleting gym equipment:", err);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the gym equipment" });
    } else {
      // Delete the product
      const deleteProductQuery = "DELETE FROM Products WHERE product_id = ?";
      db.query(deleteProductQuery, [product_id], (err, productResult) => {
        if (err) {
          console.error("Error deleting product:", err);
          res
            .status(500)
            .json({ error: "An error occurred while deleting the product" });
        } else {
          console.log(
            `Product with ID ${product_id} and its gym equipment deleted successfully`
          );
          //res.status(200).json({ message: 'Product and gym equipment deleted successfully' });
          res.redirect(`http://localhost:3000/gymequipment`);
        }
      });
    }
  });
});

app.post("/gymequipment/update", upload.single("image"), (req, res) => {
  const product_id = req.session.product_id;
  console.log(`${req.session.product_id}`);
  // Get the product_id from the URL
  // console.log(`${product_id}`);
  const { product_name, description, price, stock_quantity, weight, brand } =
    req.body;
  const imageurl = req.file ? "uploads/" + req.file.filename : null;
  console.log("Received data:", req.body);
  console.log(
    `Product Name: ${product_name} Description: ${description} Price: ${price} Stock : ${stock_quantity} weight : ${weight}`
  );

  // Create the update query for the GymEquipment table
  const updateGymEquipmentQuery =
    "UPDATE GymEquipment SET weight = ? WHERE product_id = ?";
  db.query(updateGymEquipmentQuery, [weight, product_id], (err, result) => {
    if (err) {
      console.error("Error updating gym equipment:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating the gym equipment" });
    } else {
      console.log("Gym equipment updated successfully");

      // Check if product attributes are provided for update
      if (
        product_name &&
        brand &&
        description &&
        price &&
        stock_quantity &&
        imageurl
      ) {
        // Create the update query for the Products table
        const updateProductQuery =
          "UPDATE Products SET product_name = ?, brand = ?, description = ?, imageurl = ?, price = ?, stock_quantity = ? WHERE product_id = ?";
        db.query(
          updateProductQuery,
          [
            product_name,
            brand,
            description,
            imageurl,
            price,
            stock_quantity,
            product_id,
          ],
          (err, result) => {
            if (err) {
              console.error("Error updating product:", err);
              res
                .status(500)
                .json({
                  error: "An error occurred while updating the product",
                });
            }
          }
        );
      }

      console.log("Database update result:", result);
      console.log("Gym equipment and Product updated successfully");
      // res.status(200).json({ message: 'Gym equipment and Product updated successfully' });
      res.redirect(`http://localhost:3000/gymequipment`);
    }
  });
});
app.post("/merchandise/update", upload.single("image"), (req, res) => {
  const product_id = req.session.product_id;
  console.log(`${req.session.product_id}`);
  // Get the product_id from the URL
  // console.log(`${product_id}`);
  const {
    product_name,
    description,
    price,
    stock_quantity,
    brand,
    size,
    color,
  } = req.body;
  const imageurl = req.file ? "uploads/" + req.file.filename : null;
  console.log("Received data:", req.body);
  console.log(
    `Product Name: ${product_name} Description: ${description} Price: ${price} Stock : ${stock_quantity} size : ${size},color: ${color}`
  );

  // Create the update query for the Merchandise table
  const updateMerchandiseQuery =
    "UPDATE Merchandise SET size = ?,color=? WHERE product_id = ?";
  db.query(updateMerchandiseQuery, [size, color, product_id], (err, result) => {
    if (err) {
      console.error("Error updating merchandise:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating the merchandise" });
    } else if (result.affectedRows === 0) {
      console.log("No rows were updated. Check if the product_id exists.");
    } else {
      console.log("Merchandise updated successfully");

      // Check if product attributes are provided for update
      if (
        product_name &&
        brand &&
        description &&
        price &&
        stock_quantity &&
        imageurl
      ) {
        // Create the update query for the Products table
        const updateProductQuery =
          "UPDATE Products SET product_name = ?, brand = ?, description = ?, imageurl = ?, price = ?, stock_quantity = ? WHERE product_id = ?";
        db.query(
          updateProductQuery,
          [
            product_name,
            brand,
            description,
            imageurl,
            price,
            stock_quantity,
            product_id,
          ],
          (err, result) => {
            if (err) {
              console.error("Error updating product:", err);
              res
                .status(500)
                .json({
                  error: "An error occurred while updating the product",
                });
            }
          }
        );
      }

      console.log("Database update result:", result);
      console.log("Merchandise and Product updated successfully");
      // res.status(200).json({ message: 'Merchandise and Product updated successfully' });
      res.redirect(`http://localhost:3000/merchandise`);
    }
  });
});

app.post("/supplements/update", upload.single("image"), (req, res) => {
  const product_id = req.session.product_id;
  console.log(`${req.session.product_id}`);
  // Get the product_id from the URL
  // console.log(`${product_id}`);
  const {
    product_name,
    description,
    price,
    stock_quantity,
    weight,
    brand,
    expiry_date,
  } = req.body;
  const imageurl = req.file ? "uploads/" + req.file.filename : null;
  console.log("Received data:", req.body);
  console.log(
    `Product Name: ${product_name} Description: ${description} Price: ${price} Stock : ${stock_quantity} weight : ${weight}`
  );
  // Create the update query for the Supplements table
  const updateSupplementQuery =
    "UPDATE Supplements SET weight = ?, expiry_date = ? WHERE product_id = ?";
  db.query(
    updateSupplementQuery,
    [weight, expiry_date, product_id],
    (err, result) => {
      if (err) {
        console.error("Error updating supplement:", err);
        res
          .status(500)
          .json({ error: "An error occurred while updating the supplement" });
      } else {
        console.log("Supplement updated successfully");

        // Check if product attributes are provided for update
        if (
          product_name &&
          brand &&
          description &&
          price &&
          stock_quantity &&
          imageurl
        ) {
          // Create the update query for the Products table
          const updateProductQuery =
            "UPDATE Products SET product_name = ?, brand = ?, description = ?,imageurl=?, price = ?, stock_quantity = ? WHERE product_id = ?";
          db.query(
            updateProductQuery,
            [
              product_name,
              brand,
              description,
              imageurl,
              price,
              stock_quantity,
              product_id,
            ],
            (err, result) => {
              if (err) {
                console.error("Error updating product:", err);
                res
                  .status(500)
                  .json({
                    error: "An error occurred while updating the product",
                  });
              }
            }
          );
          console.log("Update Supplement Query:", updateSupplementQuery);
          console.log("Update Product Query:", updateProductQuery);
        }
        console.log("Database update result:", result);
        console.log("Supplement and Product updated successfully");
        //res.status(200).json({ message: 'Supplement and Product updated successfully' });
        res.redirect(`http://localhost:3000/supplements`);
      }
    }
  );
});
// app.post('/submit-order', async (req, res) => {
//   const userId = req.session.userId; // Assuming you store user ID in session during login
//   //const db = require('../db'); // Import your database connection

//   try {
//     // Start a transaction
//     await db.beginTransaction();

//     // Fetch cart items
//     const selectCartItemsQuery = `
//       SELECT Products.product_id, Products.price, Products.stock_quantity, CartItems.quantity
//       FROM CartItems
//       JOIN Products ON CartItems.product_id = Products.product_id
//       JOIN Cart ON CartItems.cart_id = Cart.cart_id
//       WHERE Cart.customer_id = ?
//     `;

//     const cartItems = await db.queryAsync(selectCartItemsQuery, [userId]);

//     // Create a new order
//     const createOrderQuery = 'INSERT INTO Orders (customer_id, order_date, status) VALUES (?, CURRENT_TIMESTAMP, ?)';
//     const orderResult = await db.queryAsync(createOrderQuery, [userId, 'Processing']);
//     const orderId = orderResult.insertId;

//     // Insert items into OrderItems table
//     const insertOrderItemsQuery = 'INSERT INTO OrderItems (order_id, product_id, quantity) VALUES ?';
//     const orderItemsValues = cartItems.map(item => [orderId, item.product_id, item.quantity]);
//     await db.queryAsync(insertOrderItemsQuery, [orderItemsValues]);

//     // Check product quantities and update/delete
//     for (const item of cartItems) {
//       const remainingQuantity = item.stock_quantity - item.quantity;

//       if (remainingQuantity <= 0) {
//         // If the remaining quantity is 0 or less, remove from Supplements table
//         const removeSupplementQuery = 'DELETE FROM Supplements WHERE product_id = ?';
//         await db.queryAsync(removeSupplementQuery, [item.product_id]);

//         // Remove from Products table
//         const removeProductQuery = 'DELETE FROM Products WHERE product_id = ?';
//         await db.queryAsync(removeProductQuery, [item.product_id]);
//       } else {
//         // If remaining quantity is greater than 0, update the quantity in Products table
//         const updateProductQuery = 'UPDATE Products SET stock_quantity = ? WHERE product_id = ?';
//         await db.queryAsync(updateProductQuery, [remainingQuantity, item.product_id]);
//       }
//     }

//     // Insert shipping details using user information
//     const selectUserQuery = 'SELECT * FROM user WHERE id = ?';
//     const user = await db.queryAsync(selectUserQuery, [userId]);

//     if (user.length === 0) {
//       throw new Error('User not found');
//     }

//     const userData = user[0];

//     const insertShippingDetailsQuery = `
//       INSERT INTO ShippingDetails (order_id, full_name, contact_no, address, payment_method, amount, transaction_date)
//       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
//     `;

//     const { Fname, Lname, phoneno, address } = userData;
//     const amount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + 500;

//     await db.queryAsync(
//       insertShippingDetailsQuery,
//       [orderId, `${Fname} ${Lname}`, phoneno, address, 'Cash on Delivery', amount]
//     );

//     // Optionally, you may want to clear the user's cart after placing the order
//     const clearCartQuery = 'DELETE FROM CartItems WHERE cart_id IN (SELECT cart_id FROM Cart WHERE customer_id = ?)';
//     await db.queryAsync(clearCartQuery, [req.session.userId]);

//     // Commit the transaction
//     await db.commit();

//     return res.status(200).json({ message: 'Order placed successfully' });
//   } catch (error) {
//     // Rollback the transaction in case of an error
//     await db.rollback();

//     console.error('Error processing order:', error);
//     return res.status(500).json({ error: 'An error occurred while processing the order' });
//   } finally {
//     // Ensure to release the connection after the transaction
//     db.release();
//   }
// });

//const db = require('../db'); // Import your database connection

// app.post('/submit-order', async (req, res) => {
//   const userId = req.session.userId; // Assuming you store user ID in session during login
//   let connection;

//   try {
//     // Start a transaction
//     connection = await db.getConnection();
//     await connection.beginTransaction();

//     // Fetch cart items
//     const selectCartItemsQuery = `
//       SELECT Products.product_id, Products.price, Products.stock_quantity, CartItems.quantity
//       FROM CartItems
//       JOIN Products ON CartItems.product_id = Products.product_id
//       JOIN Cart ON CartItems.cart_id = Cart.cart_id
//       WHERE Cart.customer_id = ?
//     `;

//     const [cartItems] = await connection.query(selectCartItemsQuery, [userId]);

//     // Create a new order
//     const createOrderQuery = 'INSERT INTO Orders (customer_id, order_date, status) VALUES (?, CURRENT_TIMESTAMP, ?)';
//     const [orderResult] = await connection.query(createOrderQuery, [userId, 'Processing']);
//     const orderId = orderResult.insertId;

//     // Insert items into OrderItems table
//     const insertOrderItemsQuery = 'INSERT INTO OrderItems (order_id, product_id, quantity) VALUES ?';
//     const orderItemsValues = cartItems.map(item => [orderId, item.product_id, item.quantity]);
//     await connection.query(insertOrderItemsQuery, [orderItemsValues]);

//     // Check product quantities and update/delete
//     for (const item of cartItems) {
//       const remainingQuantity = item.stock_quantity - item.quantity;

//       if (remainingQuantity <= 0) {
//         // If the remaining quantity is 0 or less, remove from Supplements table
//         const removeSupplementQuery = 'DELETE FROM Supplements WHERE product_id = ?';
//         await db.queryAsync(removeSupplementQuery, [item.product_id]);

//         // Remove from Products table
//         const removeProductQuery = 'DELETE FROM Products WHERE product_id = ?';
//         await db.queryAsync(removeProductQuery, [item.product_id]);
//       } else {
//         // If remaining quantity is greater than 0, update the quantity in Products table
//         const updateProductQuery = 'UPDATE Products SET stock_quantity = ? WHERE product_id = ?';
//         await db.queryAsync(updateProductQuery, [remainingQuantity, item.product_id]);
//       }
//     }

//     // Insert shipping details using user information
//     const selectUserQuery = 'SELECT * FROM user WHERE id = ?';
//     const user = await db.queryAsync(selectUserQuery, [userId]);

//     if (user.length === 0) {
//       throw new Error('User not found');
//     }

//     const userData = user[0];

//     const insertShippingDetailsQuery = `
//       INSERT INTO ShippingDetails (order_id, full_name, contact_no, address, payment_method, amount, transaction_date)
//       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
//     `;

//     const { Fname, Lname, phoneno, address } = userData;
//     const amount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + 500;

//     await db.queryAsync(
//       insertShippingDetailsQuery,
//       [orderId, `${Fname} ${Lname}`, phoneno, address, 'Cash on Delivery', amount]
//     );

//     // Optionally, you may want to clear the user's cart after placing the order
//     const clearCartQuery = 'DELETE FROM CartItems WHERE cart_id IN (SELECT cart_id FROM Cart WHERE customer_id = ?)';
//     await db.queryAsync(clearCartQuery, [req.session.userId]);

//     // ... rest of your code ...

//     // Commit the transaction
//     await connection.commit();

//     return res.status(200).json({ message: 'Order placed successfully' });
//   } catch (error) {
//     // Rollback the transaction in case of an error
//     if (connection) {
//       await connection.rollback();
//     }

//     console.error('Error processing order:', error);
//     return res.status(500).json({ error: 'An error occurred while processing the order' });
//   } finally {
//     // Ensure to release the connection after the transaction
//     if (connection) {
//       connection.end();
//     }
//   }
// });

//MAIN
app.post("/submit-order", (req, res) => {
  const userId = req.session.userId; // Assuming you store user ID in session during login

  // Fetch cart items
  const selectCartItemsQuery = `
    SELECT Products.product_id, Products.price, Products.stock_quantity, CartItems.quantity
    FROM CartItems
    JOIN Products ON CartItems.product_id = Products.product_id
    JOIN Cart ON CartItems.cart_id = Cart.cart_id
    WHERE Cart.customer_id = ?
  `;

  db.query(selectCartItemsQuery, [userId], (err, cartItems) => {
    if (err) {
      console.error("Error fetching cart items:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching cart items" });
    }

    // Create a new order
    const createOrderQuery =
      "INSERT INTO Orders (customer_id, order_date, status) VALUES (?, CURRENT_TIMESTAMP, ?)";
    db.query(createOrderQuery, [userId, "Processing"], (err, orderResult) => {
      if (err) {
        console.error("Error creating order:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while creating the order" });
      }

      const orderId = orderResult.insertId;

      // Insert items into OrderItems table
      const insertOrderItemsQuery =
        "INSERT INTO OrderItems (order_id, product_id, quantity) VALUES (?)";
      const orderItemsValues = cartItems.map((item) => [
        orderId,
        item.product_id,
        item.quantity,
      ]);

      db.query(insertOrderItemsQuery, orderItemsValues, (err) => {
        if (err) {
          console.error("Error inserting into OrderItems:", err);
          return res
            .status(500)
            .json({
              error: "An error occurred while inserting into OrderItems",
            });
        }

        // Check product quantities and update/delete
        cartItems.forEach((item) => {
          const remainingQuantity = item.stock_quantity - item.quantity;

          if (remainingQuantity <= 0) {
            // If the remaining quantity is 0 or less, remove from Supplements table
            const removeSupplementQuery =
              "DELETE FROM Supplements WHERE product_id = ?";
            db.query(removeSupplementQuery, [item.product_id], (err) => {
              if (err) {
                console.error("Error removing from Supplements table:", err);
              }
            });

            // Remove from Products table
            const removeProductQuery =
              "DELETE FROM Products WHERE product_id = ?";
            db.query(removeProductQuery, [item.product_id], (err) => {
              if (err) {
                console.error("Error removing from Products table:", err);
              }
            });
          } else {
            // If remaining quantity is greater than 0, update the quantity in Products table
            const updateProductQuery =
              "UPDATE Products SET stock_quantity = ? WHERE product_id = ?";
            db.query(
              updateProductQuery,
              [remainingQuantity, item.product_id],
              (err) => {
                if (err) {
                  console.error(
                    "Error updating stock quantity in Products table:",
                    err
                  );
                }
              }
            );
          }
        });

        // Insert shipping details using user information
        const selectUserQuery = "SELECT * FROM user WHERE id = ?";
        db.query(selectUserQuery, [userId], (err, user) => {
          if (err) {
            console.error("Error fetching user information:", err);
            return res
              .status(500)
              .json({
                error: "An error occurred while fetching user information",
              });
          }

          if (user.length === 0) {
            return res.status(404).json({ error: "User not found" });
          }

          const userData = user[0];

          const insertShippingDetailsQuery = `
            INSERT INTO ShippingDetails (order_id, full_name, contact_no, address, payment_method, amount, transaction_date)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `;

          const { Fname, Lname, phoneno, address } = userData;
          const amount =
            cartItems.reduce(
              (total, item) => total + item.price * item.quantity,
              0
            ) + 500;

          db.query(
            insertShippingDetailsQuery,
            [
              orderId,
              `${Fname} ${Lname}`,
              phoneno,
              address,
              "Cash on Delivery",
              amount,
            ],
            (err) => {
              if (err) {
                console.error("Error inserting into ShippingDetails:", err);
                return res
                  .status(500)
                  .json({
                    error:
                      "An error occurred while inserting into ShippingDetails",
                  });
              }

              // Optionally, you may want to clear the user's cart after placing the order
              const clearCartQuery =
                "DELETE FROM CartItems WHERE cart_id IN (SELECT cart_id FROM Cart WHERE customer_id = ?)";
              db.query(clearCartQuery, [req.session.userId], (err) => {
                if (err) {
                  console.error("Error clearing cart:", err);
                  return res
                    .status(500)
                    .json({
                      error: "An error occurred while clearing the cart",
                    });
                }

                //return res.status(200).json({ message: 'Order placed successfully' });
                res.redirect(`http://localhost:3000/customer/products`);
              });
            }
          );
        });
      });
    });
  });
});

app.post("/gymequipment/add-to-cart/:productId", (req, res) => {
  const productId = req.params.productId;
  const userId = req.session.userId; // Assuming you store user ID in session during login
  const quantity = req.body.quantity;
  // Fetch product information based on the productId
  const selectProductQuery = "SELECT * FROM Products WHERE product_id = ?";

  db.query(selectProductQuery, [productId], (err, productData) => {
    if (err) {
      console.error("Error fetching product data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching product data" });
    }

    if (productData.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Extract relevant information from the product data
    const { product_id, product_name, price, stock_quantity } = productData[0];

    // Check if the cart exists for the user
    const selectCartQuery = "SELECT * FROM Cart WHERE customer_id = ?";

    db.query(selectCartQuery, [req.session.userId], (err, cartData) => {
      if (err) {
        console.error("Error checking cart:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while checking cart" });
      }

      let cartId;
      if (cartData.length === 0) {
        // If the cart does not exist, create a new cart
        const insertCartQuery =
          "INSERT INTO Cart (customer_id, date_created) VALUES (?, CURDATE())";
        db.query(insertCartQuery, [req.session.userId], (err, result) => {
          if (err) {
            console.error("Error creating new cart:", err);
            return res
              .status(500)
              .json({ error: "An error occurred while creating new cart" });
          }

          cartId = result.insertId;
        });
      } else {
        cartId = cartData[0].cart_id;
      }

      // Check if the product is already in the cart for the user
      const selectCartItemQuery =
        "SELECT * FROM CartItems WHERE cart_id = ? AND product_id = ?";

      db.query(
        selectCartItemQuery,
        [cartId, productId],
        (err, cartItemData) => {
          if (err) {
            console.error("Error checking cart items:", err);
            return res
              .status(500)
              .json({ error: "An error occurred while checking cart items" });
          }

          // If the product is not in the cart, insert a new entry; otherwise, update the quantity
          if (cartItemData.length === 0) {
            const insertCartItemQuery =
              "INSERT INTO CartItems (cart_id, product_id, quantity) VALUES (?, ?, ?)";
            db.query(
              insertCartItemQuery,
              [cartId, product_id, quantity],
              (err) => {
                if (err) {
                  console.error("Error adding item to cart:", err);
                  return res
                    .status(500)
                    .json({
                      error: "An error occurred while adding item to cart",
                    });
                }
                console.log("QUANTITY: ", quantity);
                //return res.json({ message: 'Item added to cart successfully' });
                res.redirect(`http://localhost:3000/customer/gymequipment`);
              }
            );
          } else {
            const updateCartItemQuery =
              "UPDATE CartItems SET quantity = quantity + 1 WHERE cart_id = ? AND product_id = ?";
            db.query(updateCartItemQuery, [cartId, productId], (err) => {
              if (err) {
                console.error("Error updating item quantity in cart:", err);
                return res
                  .status(500)
                  .json({
                    error:
                      "An error occurred while updating item quantity in cart",
                  });
              }

              //return res.json({ message: 'Item quantity updated in cart successfully' });
              res.redirect(`http://localhost:3000/customer/gymequipment`);
            });
          }
        }
      );
    });
  });
});
app.post("/merchandise/add-to-cart/:productId", (req, res) => {
  const productId = req.params.productId;
  const userId = req.session.userId; // Assuming you store user ID in session during login

  // Fetch merchandise information based on the productId
  const selectMerchandiseQuery =
    "SELECT * FROM Merchandise WHERE product_id = ?";

  db.query(selectMerchandiseQuery, [productId], (err, merchandiseData) => {
    if (err) {
      console.error("Error fetching merchandise data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching merchandise data" });
    }

    if (merchandiseData.length === 0) {
      return res.status(404).json({ error: "Merchandise not found" });
    }

    // Extract relevant information from the merchandise data
    const { product_id, product_name, price, stock_quantity } =
      merchandiseData[0];

    // Check if the cart exists for the user
    const selectCartQuery = "SELECT * FROM Cart WHERE customer_id = ?";

    db.query(selectCartQuery, [req.session.userId], (err, cartData) => {
      if (err) {
        console.error("Error checking cart:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while checking cart" });
      }

      let cartId;
      if (cartData.length === 0) {
        // If the cart does not exist, create a new cart
        const insertCartQuery =
          "INSERT INTO Cart (customer_id, date_created) VALUES (?, CURDATE())";
        db.query(insertCartQuery, [req.session.userId], (err, result) => {
          if (err) {
            console.error("Error creating new cart:", err);
            return res
              .status(500)
              .json({ error: "An error occurred while creating new cart" });
          }

          cartId = result.insertId;
        });
      } else {
        cartId = cartData[0].cart_id;
      }

      // Check if the merchandise is already in the cart for the user
      const selectCartItemQuery =
        "SELECT * FROM CartItems WHERE cart_id = ? AND product_id = ?";

      db.query(
        selectCartItemQuery,
        [cartId, productId],
        (err, cartItemData) => {
          if (err) {
            console.error("Error checking cart items:", err);
            return res
              .status(500)
              .json({ error: "An error occurred while checking cart items" });
          }

          // If the merchandise is not in the cart, insert a new entry; otherwise, update the quantity
          if (cartItemData.length === 0) {
            const insertCartItemQuery =
              "INSERT INTO CartItems (cart_id, product_id, quantity) VALUES (?, ?, ?)";
            db.query(insertCartItemQuery, [cartId, product_id, 1], (err) => {
              if (err) {
                console.error("Error adding item to cart:", err);
                return res
                  .status(500)
                  .json({
                    error: "An error occurred while adding item to cart",
                  });
              }

              //return res.json({ message: 'Item added to cart successfully' });
              res.redirect(`http://localhost:3000/customer/merchandise`);
            });
          } else {
            const updateCartItemQuery =
              "UPDATE CartItems SET quantity = quantity + 1 WHERE cart_id = ? AND product_id = ?";
            db.query(updateCartItemQuery, [cartId, productId], (err) => {
              if (err) {
                console.error("Error updating item quantity in cart:", err);
                return res
                  .status(500)
                  .json({
                    error:
                      "An error occurred while updating item quantity in cart",
                  });
              }

              //return res.json({ message: 'Item quantity updated in cart successfully' });
              res.redirect(`http://localhost:3000/customer/merchandise`);
            });
          }
        }
      );
    });
  });
});

app.post("/supplements/add-to-cart/:productId", (req, res) => {
  const productId = req.params.productId;
  const userId = req.session.userId; // Assuming you store user ID in session during login

  // Fetch product information based on the productId
  const selectProductQuery = "SELECT * FROM Products WHERE product_id = ?";

  db.query(selectProductQuery, [productId], (err, productData) => {
    if (err) {
      console.error("Error fetching product data:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching product data" });
    }

    if (productData.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Extract relevant information from the product data
    const { product_id, product_name, price, stock_quantity } = productData[0];

    // Check if the cart exists for the user
    const selectCartQuery = "SELECT * FROM Cart WHERE customer_id = ?";

    db.query(selectCartQuery, [req.session.userId], (err, cartData) => {
      if (err) {
        console.error("Error checking cart:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while checking cart" });
      }

      let cartId;
      if (cartData.length === 0) {
        // If the cart does not exist, create a new cart
        const insertCartQuery =
          "INSERT INTO Cart (customer_id, date_created) VALUES (?, CURDATE())";
        db.query(insertCartQuery, [req.session.userId], (err, result) => {
          if (err) {
            console.error("Error creating new cart:", err);
            return res
              .status(500)
              .json({ error: "An error occurred while creating new cart" });
          }

          cartId = result.insertId;
        });
      } else {
        cartId = cartData[0].cart_id;
      }

      // Check if the product is already in the cart for the user
      const selectCartItemQuery =
        "SELECT * FROM CartItems WHERE cart_id = ? AND product_id = ?";

      db.query(
        selectCartItemQuery,
        [cartId, productId],
        (err, cartItemData) => {
          if (err) {
            console.error("Error checking cart items:", err);
            return res
              .status(500)
              .json({ error: "An error occurred while checking cart items" });
          }

          // If the product is not in the cart, insert a new entry; otherwise, update the quantity
          if (cartItemData.length === 0) {
            const insertCartItemQuery =
              "INSERT INTO CartItems (cart_id, product_id, quantity) VALUES (?, ?, ?)";
            db.query(insertCartItemQuery, [cartId, product_id, 1], (err) => {
              if (err) {
                console.error("Error adding item to cart:", err);
                return res
                  .status(500)
                  .json({
                    error: "An error occurred while adding item to cart",
                  });
              }

              // return res.json({ message: 'Item added to cart successfully' });
              res.redirect(`http://localhost:3000/customer/supplements`);
            });
          } else {
            const updateCartItemQuery =
              "UPDATE CartItems SET quantity = quantity + 1 WHERE cart_id = ? AND product_id = ?";
            db.query(updateCartItemQuery, [cartId, productId], (err) => {
              if (err) {
                console.error("Error updating item quantity in cart:", err);
                return res
                  .status(500)
                  .json({
                    error:
                      "An error occurred while updating item quantity in cart",
                  });
              }

              //return res.json({ message: 'Item quantity updated in cart successfully' });
              res.redirect(`http://localhost:3000/customer/supplements`);
            });
          }
        }
      );
    });
  });
});

app.use(auth);
app.get("/", (req, res) => {
  res.render("index-2");
});
app.get("/index", (req, res) => {
  res.render("index");
});

// app.get('/', (req, res) => {
//   res.render('index.ejs');
// });
app.use((req, res) => {
  res.status(404).send("Not Found");
});
