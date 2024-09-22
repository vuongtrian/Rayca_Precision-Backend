const express = require("express");

const ticketsRouter = require("./tickets");

const router = express.Router();

router.use(process.env.TICKETS_ROUTE, ticketsRouter);

module.exports = router;
