const express = require('express');
const router = express.Router();
const db=require('../db');
const authController = require('../controllers/authController');
router.get('/login', (req, res) => {
    // Logic for the sign-in page
    res.render('login.ejs'); // Render the sign-in page
    
  });
  
  router.get('/register', (req, res) => {
    // Logic for the registration page
    res.render('register.ejs'); // Render the registration page
  });

router.post('/login',authController.loginUser);
router.post('/register',authController.registerUser);

module.exports=router;



