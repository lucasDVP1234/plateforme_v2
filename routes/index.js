// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const creatorRoutes = require('./creators');
const campaignRoutes = require('./campaigns');


// Home Route
router.get('/', async (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/account');
  }
  
  try {
    // Fetch all case studies (limit to 3 if necessary)
    
    
    res.render('index'); // Pass 'case_study' to EJS
  } catch (error) {
    console.error('Error loading the LP', error);
    res.status(500).send('Server Error');
  }
});

// Case Study Routes
router.get('/case_study1', (req, res) => {
  res.render('case_study1'); // Renders views/case_study1.ejs
});

router.get('/case_study2', (req, res) => {
  res.render('case_study2'); // Renders views/case_study2.ejs
});

router.get('/case_study3', (req, res) => {
  res.render('case_study3'); // Renders views/case_study3.ejs
});

// Use other routers
router.use('/', authRoutes);
router.use('/', userRoutes);
router.use('/', creatorRoutes);
router.use('/', campaignRoutes);

module.exports = router;
