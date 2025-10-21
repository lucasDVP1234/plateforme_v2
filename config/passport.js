// config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = function(passport) {
    console.log('Starting Passport');
    console.log('Configuring Passport with the following BASE_URL:', process.env.BASE_URL);
    const callbackURL = `${process.env.BASE_URL}/auth/google/callback`;
    console.log('Google OAuth Callback URL:', callbackURL);
  // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
        },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            companyName: profile.displayName,
          });
        }
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  ));

  // Local Strategy
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        email = email.toLowerCase().trim();
        console.log('Authenticating user:', email);

        // Find the user by email
        const user = await User.findOne({ email: email });
        if (!user) {
          console.log('User not foun');
          return done(null, false, { message: 'Incorrect email.' });
        }

        // Check if the user has a password set
        if (!user.password) {
          console.log('No password set for this user.');
          return done(null, false, { message: 'No password set for this user.' });
        }

        // Compare the password
        const match = await bcrypt.compare(password, user.password);
        console.log('Password match result:', match);
        if (match) {
          return done(null, user);
        } else {
          console.log('Incorrect password.');
          return done(null, false, { message: 'Incorrect password.' });
        }
      } catch (err) {
        console.error('Error during authentication:', err);
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
