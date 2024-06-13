const express = require('express');

const router = express.Router();

const userAuthentication = require('../middleware/auth');

const purchaseControllers = require('../controllers/purchaseControllers');

router.get('/premiumMembership', userAuthentication.authenticate, purchaseControllers.purchasePremium);

router.post('/updateTransactionStatus', userAuthentication.authenticate, purchaseControllers.updateTransactionStatus);

module.exports = router;
