const express = require("express");
const analyticRouter = require("./analytics");

const router = express.Router();

router.use(process.env.ANALYTICS_ROUTE, analyticRouter);

module.exports = router;
