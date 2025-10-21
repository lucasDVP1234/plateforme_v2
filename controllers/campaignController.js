const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Creator = require('../models/Creator');
const User = require('../models/User'); // Add this line

exports.addToCampaign = async (req, res) => {
  try {
    const creatorId = req.body.creatorId;

    // Ensure basket exists in session
    if (!req.session.basket) {
      req.session.basket = [];
    }
    

    // Add creatorId to basket if not already present
    if (!req.session.basket.includes(creatorId)) {
      req.session.basket.push(creatorId);
    }
    if (!req.user) {
      res.redirect('/login');
    }
    else {
      res.redirect('/creators');
    }

     // Redirect back to the same page
  } catch (err) {
    console.error('Error adding to campaign:', err.message);
    res.send('Error adding to campaign.');
  }
};

exports.finalizeCampaign = async (req, res) => {
  try {
    const creatorIds = req.session.basket || [];
    if (creatorIds.length === 0) {
      return res.send('Votre panier est vide.');
    }

    const creators = await Creator.find({ _id: { $in: creatorIds } });

    // Check if user profile is complete
    const user = await User.findById(req.user._id);
    if (!user.name || !user.job) {
      return res.render('campaignDetails', { selectedCreators: creators });
    }

    res.render('campaignCalendly', { selectedCreators: creators });
  } catch (err) {
    console.error('Error finalizing campaign:', err.message);
    res.send('Error finalizing campaign.');
  }
};


exports.createCampaign = async (req, res) => {
  try {
    const { name, job } = req.user; // If needed elsewhere, otherwise remove
    const creatorIds = req.session.basket || [];
    const userId = req.user._id;

    // Check if the basket exists and is not empty
    if (!creatorIds || creatorIds.length === 0) {
      // Optional: Flash message to inform the user
      //req.flash('error', 'Your basket is empty. Please add creators to your campaign.');
      return res.redirect('/creators');
    }

    // If name and job are required for campaign creation, ensure they are present
    // Uncomment and adjust if necessary
    
    if (!name || !job) {
      // Optional: Flash message to inform the user
      //req.flash('error', 'Name and job are required.');
      return res.render('campaignDetails',{ selectedCreators: creatorIds }); // Adjust route as needed
    }

    // Create new campaign
    const newCampaign = new Campaign({
      userId,
      creatorIds,
      status: 'En attente des scripts', // "Waiting for scripts" in French
      // Optional: Add other fields like date, budget, etc.
      // date: campaignDate,
    });

    await newCampaign.save();

    // Clear basket from session after successful campaign creation
    req.session.basket = [];

    // Optional: Flash message to inform the user of success
    //req.flash('success', 'Campaign created successfully.');
    if (!req.user.password){
      res.render('motdepasse');
    } else {
      res.redirect('/account')
    }
  } catch (err) {
    console.error('Error creating campaign:', err.message);
    // Optional: Flash message to inform the user of the error
    // req.flash('error', 'There was an error creating your campaign. Please try again.');
    res.status(500).send('Error creating campaign.');
  }
};


exports.firstClientBeforeCal = async (req, res) => {
  try {
    const { name, job } = req.body;
    const creatorIds = req.session.basket || [];
    const userId = req.user._id;

    // Update user with name and job
    await User.findByIdAndUpdate(userId, { name, job });

    

   
    res.redirect('/finaliser-campagne');
  } catch (err) {
    console.error('Error creating campaign:', err.message);
    res.send('Error creating campaign.');
  }
};


// In controllers/campaignController.js
exports.removeFromCampaign = (req, res) => {
  const creatorId = req.body.creatorId;
  if (req.session.basket) {
    req.session.basket = req.session.basket.filter(id => id !== creatorId);
  }
  res.redirect('back');
};




// exports.postSelectCreators = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const { creatorIds } = req.body;
//     if (!creatorIds || creatorIds.length === 0) {
//       return res.send('Please select at least one creator.');
//     }

//     // Ensure creatorIds is an array
//     const selectedCreators = Array.isArray(creatorIds) ? creatorIds : [creatorIds];

//     const creators = await Creator.find({ _id: { $in: selectedCreators } });
//     console.log(creators)

//     // Store selected creators in session or pass them to the next view
//     req.session.selectedCreators = creators;

//     // Store selected creators in session or pass them to the next view
//     //req.session.selectedCreators = selectedCreators;

//     if (!user.name || !user.job) {
//       // Redirect to the campaign details form if user info is incomplete
//         return res.render('campaignDetails', { selectedCreators: creators });
//     }
//     // Render the campaign details page
//     res.render('campaignDetails_client', { selectedCreators: creators });
//   } catch (err) {
//     console.error('Error selecting creators:', err.message);
//     next(err); // Pass the error to the next middleware (e.g., error handler)
//   }
// };


// exports.postCreateCampaign = async (req, res) => {
//   try {
//     const { name, job, budget, campaignDate } = req.body;
//     const creatorIds = req.session.selectedCreators;
//     const userId = req.user._id;

    

//     // Update user with name and job
//     await User.findByIdAndUpdate(userId, { name, job });
//     // if (!userId) {
//     //   // Handle the case where userId is not in the session
//     //   return res.redirect('/signup');
//     // }

//     // Create new campaign with budget and date
//     const newCampaign = new Campaign({
//       userId,
//       creatorIds,
//       budget,
//       date: campaignDate,
//       status: 'Pending',
//     });

//     await newCampaign.save();

//     // Clear selected creators from session
//     req.session.selectedCreators = null;

//     res.redirect('/account');
//   } catch (err) {
//     console.error('Error creating campaign:', err.message);
//     res.send('Error creating campaign.');
//   }
// };

// Create Campaign with Selected Creators
// exports.createCampaign = async (req, res) => {
//   try {
//     let { creatorIds } = req.body;

//     // Log to inspect the submitted creatorIds
//     console.log('Submitted creatorIds:', creatorIds);

//     // Check if at least one creator is selected
//     if (!creatorIds || creatorIds.length === 0) {
//       return res.send('Please select at least one creator.');
//     }

//     // Ensure creatorIds is an array
//     if (!Array.isArray(creatorIds)) {
//       creatorIds = [creatorIds]; // If a single creator is selected, make it an array
//     }

//     console.log('creatorIds:', creatorIds);

//     // No need to convert IDs manually; Mongoose will handle casting
//     // Alternatively, if you prefer, you can cast them using mongoose.Types.ObjectId

//     // Create a new campaign with the selected creators
//     const newCampaign = new Campaign({
//       userId: req.user._id,
//       creatorIds: creatorIds, // Use the array of ID strings directly
//       status: 'Pending',
//     });

//     await newCampaign.save();
//     res.redirect('/account');
//   } catch (err) {
//     console.error('Error creating campaign:', err.message);
//     res.send(`Error creating campaign: ${err.message}`);
//   }
// };
