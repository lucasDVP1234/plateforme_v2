// middlewares/auth.js

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function ensureProfileComplete(req, res, next) {
  const user = req.user;
  if (user && user.role === 'creator') {
    return res.redirect('/kreators/me/edit');
  }
  if (user && user.name && user.job) {
    return next();
  } else {
    res.redirect('/kreators');
  }
}
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).send('Access denied.');
};

function ensureCreator(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  if (req.user.role === 'creator') {
    return next();
  }

  res.status(403).send('Access denied.');
}

module.exports = { ensureAuthenticated, ensureProfileComplete, isAdmin, ensureCreator };
