// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require("connect-mongo");
const passport = require('passport');
const path = require('path');
const routes = require('./routes');
const indexRoutes = require('./routes/index');
const Creator = require('./models/Creator');
const creatorsRoutes = require('./routes/creators');
const flash = require('connect-flash'); 

//const connection = mongoose.createConnection(process.env.MONGODB_URI) 
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const app = express();


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI);


// Middleware
app.use(express.urlencoded({ extended: true }));
//app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public'))); 
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');

const sessionStore = MongoStore.create({
  client: mongoose.connection.getClient(),
  dbName: 'Plateforme'
})

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 * 30, // 1 day
    secure: process.env.NODE_ENV === 'production', // true if using HTTPS
    httpOnly: true,
    //sameSite : "none",
  },
}));

app.use(flash());

// Middleware to make flash messages available in templates
app.use(function (req, res, next) {
  res.locals.success_messages = req.flash('success');
  res.locals.error_messages = req.flash('error');
  next();
});

// Passport Configuration
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUrl = req.path;
  next();
});

// Make user object available in all templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});





app.use(async (req, res, next) => {
  res.locals.basket = req.session.basket || [];
  if (res.locals.basket.length > 0) {
    try {
      const creators = await Creator.find({ _id: { $in: res.locals.basket } });
      res.locals.basketCreators = creators;
    } catch (err) {
      console.error(err);
      res.locals.basketCreators = [];
    }
  } else {
    res.locals.basketCreators = [];
  }
  next();
});

// Routes
app.use('/creators', creatorsRoutes); 
app.use('/', indexRoutes);

// app.js
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
  

//Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app
