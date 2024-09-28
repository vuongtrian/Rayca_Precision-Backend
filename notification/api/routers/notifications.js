const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.route(process.env.SPLASH).get(notificationController.getAll);

router
  .route(process.env.NOTIFICATION_ID_ROUTE)
  .get(notificationController.getOne);

router.route(process.env.PAGING_ROUTE).get(notificationController.getTotal);

module.exports = router;
