const express = require('express');
const usersRouter = require('./users');

const router = express.Router();

router.use(process.env.USERS_ROUTE, usersRouter);

module.exports = router;
