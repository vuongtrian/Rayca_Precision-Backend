const express = require("express");
const router = express.Router();
const analyticController = require("../controllers/analyticController");

router.route(process.env.SPLASH).get(analyticController.getAll);

router
  .route("/:analyticId")
  .get(analyticController.getOne)
  .patch(analyticController.updateCustomerSatisfaction);

router.route("/user/:userId").get(analyticController.getAnalyticsByUserId);

router.route(process.env.PAGING_ROUTE).get(analyticController.getTotal);

module.exports = router;
