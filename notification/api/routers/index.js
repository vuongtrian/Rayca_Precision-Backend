const express = require("express");

const notificationsRouter = require("./notifications");

const router = express.Router();

router.use(process.env.NOTIFICATIONS_ROUTE, notificationsRouter);

module.exports = router;
