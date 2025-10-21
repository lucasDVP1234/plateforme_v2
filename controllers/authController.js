// controllers/authController.js
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Render Login Page
exports.getLogin = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/account');
  }
  res.render('login');
};

// Handle Local Login
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Erreur d\'authentification :', err);
      req.flash('error', 'Une erreur est survenue lors de l\'authentification.');
      return next(err);
    }
    if (!user) {
      console.log('Échec de l\'authentification :', info.message);
      req.flash('error', 'Adresse e-mail ou mot de passe incorrect.');
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Erreur lors de la connexion :', err);
        req.flash('error', 'Une erreur est survenue lors de la connexion.');
        return next(err);
      }
      req.flash('success', 'Connexion réussie !');
      return res.redirect('/account');
    });
  })(req, res, next);
};

// Handle Logout
exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      console.error('Logout error:', err);
      return next(err);
    }
    res.redirect('/');
  });
};

// Google OAuth Callback
exports.googleCallback = (req, res) => {
  res.redirect('/creators');
};
