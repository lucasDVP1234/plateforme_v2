// routes/campaigns.js
const express = require('express');
const campaignController = require('../controllers/campaignController');
const { ensureAuthenticated } = require('../middlewares/auth');
const router = express.Router();

// Book Creator Route
//router.post('/book', ensureAuthenticated, campaignController.bookCreator);
//router.post('/campaigns/create', ensureAuthenticated, campaignController.createCampaign);

//router.post('/campaigns/select', ensureAuthenticated, campaignController.postSelectCreators);

router.post('/campaigns/create', ensureAuthenticated, campaignController.firstClientBeforeCal);

router.post('/add-to-campaign', campaignController.addToCampaign);

router.get('/finaliser-campagne', ensureAuthenticated, campaignController.finalizeCampaign);

//router.post('/finaliser-campagne', ensureAuthenticated, campaignController.finalizeCampaign);

//router.post('/create-campaign',ensureAuthenticated, campaignController.postCreateCampaign);

router.get('/etape-2', ensureAuthenticated, campaignController.createCampaign);

// In routes/campaignRoutes.js
router.post('/remove-from-campaign',ensureAuthenticated, campaignController.removeFromCampaign);


module.exports = router;
