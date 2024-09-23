const express = require("express");
const router = express.Router();
const ticketsController = require("../controllers/ticketsController");
const authenticateController = require("../controllers/authenticationController");

router
  .route(process.env.SPLASH)
  .get(ticketsController.getAll)
  // .get(
  //   authenticateController.verifyToken,
  //   authenticateController.authorize("readAny", "ticket"),
  //   ticketsController.getAll
  // )
  // .post(authenticateController.authenticate, ticketsController.createOne);
  .post(
    authenticateController.verifyToken,
    authenticateController.authorize(
      process.env.CREATE_ANY,
      process.env.RESOURCE_PROFILE
    ),
    ticketsController.createOne
  );

router
  .route(process.env.TICKET_ID_ROUTE)
  .get(
    authenticateController.verifyToken,
    authenticateController.authorize(
      process.env.READ_ANY,
      process.env.RESOURCE_PROFILE
    ),
    ticketsController.getOne
  )
  .put(
    authenticateController.verifyToken,
    authenticateController.authorize(
      process.env.UPDATE_ANY,
      process.env.RESOURCE_PROFILE
    ),
    ticketsController.updateOne
  )
  .delete(
    authenticateController.verifyToken,
    authenticateController.authorize(
      process.env.DELETE_ANY,
      process.env.RESOURCE_PROFILE
    ),
    ticketsController.deleteOne
  )
  .patch(
    authenticateController.verifyToken,
    authenticateController.authorize(
      process.env.UPDATE_ANY,
      process.env.RESOURCE_PROFILE
    ),
    ticketsController.updatePartialOne
  );

router.route(process.env.PAGING_ROUTE).get(ticketsController.getTotal);

module.exports = router;
