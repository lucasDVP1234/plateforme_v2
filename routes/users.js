// routes/users.js
const express = require('express');
const userController = require('../controllers/userController');
const { ensureAuthenticated, ensureProfileComplete } = require('../middlewares/auth');
const router = express.Router();


// Set Password Route
router.post('/set-password', ensureAuthenticated, userController.setPassword);

// Account Page
router.get('/account', ensureAuthenticated,ensureProfileComplete, userController.getAccount);

module.exports = router;
