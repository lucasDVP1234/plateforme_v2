// controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');
const Campaign = require('../models/Campaign'); // Import Campaign
const Creator = require('../models/Creator'); // Import Creator if needed
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Render Signup Page
exports.getSignup = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/account');
  }
  res.render('signup');
};

// Handle Signup
exports.postSignup = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const companyName = req.body.companyName;
    const password = req.body.password;
    // const confirmPassword = req.body.confirmPassword;
    const name = req.body.name;
    const phone = req.body.phone;

    // Check if passwords match
    //if (password !== confirmPassword) {
      //req.flash('error', 'Les mots de passe sont différents.');
      //return res.redirect('/signup');
    //}
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);


    // Check if the email already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      req.flash('error', 'Un compte avec cet e-mail existe déjà. Veuillez vous connecter ou utiliser un autre e-mail.');
      return res.redirect('/signup');
    }

    const newUser = new User({
      name: name,
      email: email,
      phone: phone,
      companyName: companyName,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    
    
    try {
      const msg = {
        to: email,
        from: 'contact@scalevision.fr',
        templateId: 'd-de0daf39888d4a689abaf6ea32f99c12',
        
      };
      await sgMail.send(msg);
      console.log('Email sent');
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'email :', err);
      req.flash('error', 'Une erreur est survenue lors de l\'envoi de l\'email. Veuillez réessayer.');
    }
    try {
      const msg = {
        to: email,
        from: 'contact@scalevision.fr',
        templateId: 'd-255935cfaa014329a5055036f4a2ffe4',
        
      };
      await sgMail.send(msg);
      console.log('Email sent');
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'email :', err);
      req.flash('error', 'Une erreur est survenue lors de l\'envoi 2 de l\'email. Veuillez réessayer.');
    }

    // Authenticate the user after successful signup
    req.logIn(savedUser, function (err) {
      if (err) {
        req.flash('error', 'Une erreur est survenue lors de la connexion.');
        return res.redirect('/');
      }
      return res.redirect('/kreators');
    });
  } catch (err) {
    console.error('Erreur lors de l\'inscription :', err);
    req.flash('error', 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
    res.redirect('/signup');
  }
};

// Set Password
exports.setPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.send('Passwords do not match.');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the user's password in the database
    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });
    console.log('Password updated for user:', req.user._id);

    
    req.flash('success', 'Votre mot de passe a bien été changé !');
    
    res.redirect('/account');
  } catch (err) {
    console.error('Erreur lors de l\'inscription :', err);
    req.flash('error', 'Une erreur est survenue lors de votre changement de mot de passe. Veuillez réessayer.');
    res.redirect('/account');
    
  }
};

// Render Account Page
exports.getAccount = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user.name || !user.job) {
      // Redirect to the campaign details form if user info is incomplete
        return res.redirect('/kreators');
      }
      // Find all campaigns for the logged-in user and populate the creator names
      const campaigns = await Campaign.find({ userId: req.user._id })
        .populate('creatorIds', 'name profileImage'); // Populate creators' names
  
      
  
      // Map campaigns to include the creators' names and count of creators
      const campaignsWithCreators = campaigns.map((campaign) => {
        let creators = [];
        if (Array.isArray(campaign.creatorIds)) {
          // campaign.creatorIds is an array
          creators = campaign.creatorIds.map((creator) => ({
            name : creator.name, 
            photo : creator.profileImage
          }));

        } else if (campaign.creatorIds) {
          // campaign.creatorIds is a single object
          creators = [{
            name: campaign.creatorIds.name,
            photo: campaign.creatorIds.profileImage,
          }];
        } else {
          // campaign.creatorIds is undefined or null
          creators = [];
        }
  
        const creatorCount = creators.length;
  
        return {
          creators,
          creatorCount,
          budget: campaign.budget,
          date: campaign.date ? campaign.date.toDateString() : 'N/A',
          status: campaign.status,
        };
      });
      
  
      // Render the account page with the campaigns and the user info
      res.render('account', { campaigns: campaignsWithCreators, user: req.user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching campaigns.');
    }
  };

  // Render Forgot Password Page
exports.getForgotPassword = (req, res) => {
  res.render('forgot');
};

// Handle Forgot Password Form Submission
exports.postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash('error', 'Aucun compte trouvé avec cet e-mail.');
      return res.redirect('/forgot');
    }

    // Generate reset token
    const token = crypto.randomBytes(20).toString('hex');

    // Set token and expiration on user
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);


    const resetURL = `${process.env.BASE_URL}/reset/${token}`;

    // Send the email
    const msg = {
      to: user.email,
      from: 'contact@scalevision.fr',
      subject: '[Kreators] - Réinitialisation du mot de passe',
      text: `Vous recevez cet email parce que vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.\n\n
      Veuillez cliquer sur le lien suivant, ou copiez-le dans votre navigateur pour compléter le processus dans l'heure qui suit:\n\n
      ${resetURL}\n\n
      Si vous n'avez pas demandé ceci, veuillez ignorer cet email et votre mot de passe restera inchangé.\n`
  };

  await sgMail.send(msg);

    req.flash('success', 'Un email vous a été envoyé avec les instructions pour réinitialiser votre mot de passe.');
    res.redirect('/forgot');
  } catch (err) {
    console.error('Erreur lors de la demande de réinitialisation du mot de passe:', err);
    req.flash('error', 'Une erreur est survenue, veuillez réessayer plus tard.');
    res.redirect('/forgot');
  }
};

// Render Reset Password Page
exports.getResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ 
      resetPasswordToken: token, 
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      req.flash('error', 'Le lien de réinitialisation du mot de passe est invalide ou a expiré.');
      return res.redirect('/forgot');
    }
    res.render('reset', { token });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue.');
    res.redirect('/forgot');
  }
};

// Handle Reset Password Form Submission
exports.postResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      req.flash('error', 'Les mots de passe ne correspondent pas.');
      return res.redirect('back');
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error', 'Le lien de réinitialisation du mot de passe est invalide ou a expiré.');
      return res.redirect('/forgot');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash('success', 'Votre mot de passe a été réinitialisé avec succès! Vous pouvez maintenant vous connecter.');
    res.redirect('/login');
  } catch (err) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', err);
    req.flash('error', 'Une erreur est survenue. Veuillez réessayer.');
    res.redirect('/forgot');
  }
};