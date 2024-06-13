const express = require('express');

const userAuthentication = require('../middleware/auth');
const premiumControllers = require('../controllers/premiumControllers');

const router = express.Router()

router.get('/leaderboard', userAuthentication.authenticate, premiumControllers.getPremiumLeaderboard);

module.exports = router;
