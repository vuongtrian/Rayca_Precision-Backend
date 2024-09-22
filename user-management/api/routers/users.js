const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authenticateController = require('../controllers/authenticationController');
const authorizationController = require('../controllers/authorizationController')
const mfaAuthorizationController = require('../controllers/mfaAuthenticationController')

router.route(process.env.SPLASH).post(usersController.register);
router.route(process.env.LOGIN_ROUTE).post(usersController.login);
router.route(process.env.AUTHORIZE_ROUTE).post(authenticateController.authenticate, authorizationController.authorize(process.env.READ_ANY, process.env.RESOURCE_PROFILE), usersController.testAuthorization);
router.route(process.env.ENABLE_MFA_ROUTE).post(authenticateController.authenticate, usersController.enableMFA);
router.route(process.env.VERIFY_MFA_ROUTE).post(authenticateController.authenticate, mfaAuthorizationController.verifyMFA);

module.exports = router;
