// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const kreatorRoutes = require('./kreators');
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
router.use('/kreators', kreatorRoutes);

router.get('/creators', (req, res) => res.redirect(301, '/kreators'));
router.get('/creators/*', (req, res) => {
  const suffix = req.path.replace('/creators', '');
  return res.redirect(301, `/kreators${suffix}`);
});
router.use('/', campaignRoutes);

module.exports = router;
