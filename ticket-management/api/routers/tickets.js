const express = require("express");
const router = express.Router();
const ticketsController = require("../controllers/ticketsController");
// const authenticateController = require("../controllers/authenticationController");

router
  .route(process.env.SPLASH)
  .get(ticketsController.getAll)
  // .post(authenticateController.authenticate, ticketsController.createOne);
  .post(ticketsController.createOne);

router
  .route(process.env.TICKET_ID_ROUTE)
  .get(ticketsController.getOne)
  .put(ticketsController.updateOne)
  .delete(ticketsController.deleteOne)
  .patch(ticketsController.updatePartialOne);
// .put(authenticateController.authenticate, ticketsController.updateOne)
// .delete(authenticateController.authenticate, ticketsController.deleteOne)
// .patch(
//   authenticateController.authenticate,
//   ticketsController.updatePartialOne
// );

router.route(process.env.PAGING_ROUTE).get(ticketsController.getTotal);

module.exports = router;
