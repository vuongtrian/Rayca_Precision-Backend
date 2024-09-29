const express = require("express");
const router = express.Router();
const analyticController = require("../controllers/analyticController");

router.route(process.env.SPLASH).get(analyticController.getAll);

router
  .route(process.env.ANALYTIC_ID_ROUTE)
  .get(analyticController.getOne)
  .patch(analyticController.updateCustomerSatisfaction);

router
  .route(process.env.GET_ANALYTIC_BY_USER_ID_ROUTE)
  .get(analyticController.getAnalyticsByUserId);

router.route(process.env.PAGING_ROUTE).get(analyticController.getTotal);

module.exports = router;
