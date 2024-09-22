const express = require("express");
// const usersRouter = require("./users");
// const moviesRouter = require('./movies');
// const actorRouter = require('./actor');
const ticketsRouter = require("./tickets");
const router = express.Router();

// router.use(process.env.USERS_ROUTE, usersRouter);
router.use(process.env.TICKETS_ROUTE, ticketsRouter);
// router.use(process.env.MOVIES_ROUTE, moviesRouter);
// router.use(process.env.MOVIES_ROUTE, actorRouter);

module.exports = router;
