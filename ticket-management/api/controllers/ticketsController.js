const mongoose = require("mongoose");
const callbackify = require("util").callbackify;
const responseUtil = require("../util/responseUtil");
const redisUtil = require("../data/redisUtil");
const rabbitmqUtil = require("../util/rabbitmq-producer");
const Ticket = mongoose.model(process.env.TICKET_MODEL);

const getAll = async function (req, res) {
  let offset = parseFloat(process.env.DEFAULT_OFFSET, 10);
  let count = parseFloat(process.env.DEFAULT_COUNT, 10);
  let maxCount = parseInt(process.env.DEFAULT_MAX_FIND_LIMIT, 10);
  let query = {};

  if (req.query.offset) {
    offset = parseInt(req.query.offset);
  }
  if (req.query.count) {
    count = parseInt(req.query.count);
  }

  if (req.query.search) {
    query.name = new RegExp(
      req.query.search,
      process.env.IGNORE_CASE_SENSITIVE
    );
  }

  if (isNaN(offset) || isNaN(count)) {
    responseUtil._sendReponseWithStatusAndMessage(
      res,
      parseInt(process.env.HTTP_BAD_REQUEST_STATUS_CODE),
      process.env.ERROR_QUERY_OFFSET_COUNT_MESSAGE
    );
    return;
  }

  if (count > maxCount) {
    responseUtil._sendReponseWithStatusAndMessage(
      res,
      parseInt(process.env.HTTP_BAD_REQUEST_STATUS_CODE),
      process.env.ERROR_MAXCOUNT_MESSAGE + maxCount
    );
    return;
  }
  let response = responseUtil._initResponse();

  const redisCached = await redisUtil.getCache(req.query.cacheKey);
  if (redisCached) {
    console.log("Get from Redis");
    responseUtil._getSuccessResponse(JSON.parse(redisCached), response);
    responseUtil._sendReponse(res, response);
  } else {
    console.log("Get from MongoDB");
    Ticket.find(query)
      .skip(offset)
      .limit(count)
      .exec()
      .then((tickets) => {
        redisUtil.setCache(req.query.cacheKey, tickets);
        responseUtil._getSuccessResponse(tickets, response);
      })
      .catch((err) => responseUtil._getErrorResponse(err, response))
      .finally(() => responseUtil._sendReponse(res, response));
  }
};

const createOne = async function (req, res) {
  let newTicket = {
    title: req.body.title,
    description: req.body.description,
    status: req.body.status || "open",
    priority: req.body.priority || "medium",
    assignedTo: req.body.assignedTo,
    tags: req.body.tags || [],
  };

  let response = responseUtil._initResponse();

  try {
    // Create the new ticket
    const createdTicket = await Ticket.create(newTicket);

    // Send the message to RabbitMQ after ticket creation
    // await rabbitmqUtil._sendMessage({
    //   event: "TicketCreated",
    //   ticket: createdTicket,
    // });
    const queue = "ticket_notification";
    const message = {
      ticketId: createdTicket._id,
      userId: createdTicket.assignedTo,
      content: "A new ticket is created",
    };
    await rabbitmqUtil._sendMessage(queue, message);

    // Return success response
    responseUtil._getSuccessResponse(createdTicket, response);
  } catch (err) {
    // Handle errors
    responseUtil._getErrorResponse(err, response);
  } finally {
    // Send the response back to the client
    responseUtil._sendReponse(res, response);
  }
};

const deleteOne = function (req, res) {
  let ticketId = req.params.ticketId;
  let response = responseUtil._initResponse();
  Ticket.findByIdAndDelete(ticketId)
    .exec()
    .then((ticket) =>
      responseUtil._checkExistedData(
        ticket,
        response,
        process.env.ERROR_TICKET_ID_NOT_FOUNT_MESSAGE
      )
    )
    .then((deletedTicket) =>
      responseUtil._getDeleteSuccessResponse(deletedTicket, response)
    )
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

const getOne = function (req, res) {
  let ticketId = req.params.ticketId;
  let response = responseUtil._initResponse();
  Ticket.findById(ticketId)
    .exec()
    .then((ticket) =>
      responseUtil._checkExistedData(
        ticket,
        response,
        process.env.ERROR_TICKET_ID_NOT_FOUNT_MESSAGE
      )
    )
    .then((foundTicket) =>
      responseUtil._getSuccessResponse(foundTicket, response)
    )
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

const updateOne = async function (req, res) {
  let ticketId = req.params.ticketId;
  await _findAndUpdateTicket(ticketId, req, res, _fillFullUpdateTicket);
};

const updatePartialOne = function (req, res) {
  let ticketId = req.params.ticketId;
  _findAndUpdateTicket(ticketId, req, res, _fillPartialUpdateTicket);
};

const _fillPartialUpdateTicket = function (ticket, req) {
  if (req.body.title) {
    ticket.title = req.body.title;
  }
  if (req.body.description) {
    ticket.description = req.body.description;
  }
  if (req.body.status) {
    ticket.status = req.body.status;
  }
  if (req.body.priority) {
    ticket.priority = req.body.priority;
  }
  if (req.body.assignedTo) {
    ticket.assignedTo = req.body.assignedTo;
  }
  if (req.body.tags) {
    ticket.tags = req.body.tags;
  }
  return new Promise((resolve) => {
    resolve(ticket);
  });
};

const _fillFullUpdateTicket = function (ticket, req) {
  ticket.title = req.body.title;
  ticket.description = req.body.description;
  ticket.status = req.body.status;
  ticket.priority = req.body.priority;
  ticket.assignedTo = req.body.assignedTo;
  ticket.tags = req.body.tags;
  return new Promise((resolve) => {
    resolve(ticket);
  });
};

// const _findAndUpdateTicket = function (ticketId, req, res, fillUpdateTicket) {
//   let response = responseUtil._initResponse();
//   Ticket.findById(ticketId)
//     .exec()
//     .then((ticket) =>
//       responseUtil._checkExistedData(
//         ticket,
//         response,
//         process.env.ERROR_TICKET_ID_NOT_FOUNT_MESSAGE
//       )
//     )
//     .then((foundTicket) => fillUpdateTicket(foundTicket, req))
//     .then((filledTicket) => _updateOneTicket(filledTicket))
//     .then(async (updatedTicket) => {
//       responseUtil._getSuccessResponse(updatedTicket, response);
//       const queue = "ticket_notification";
//       const message = {
//         ticketId: ticketId,
//         userId: updatedTicket.assignedTo,
//         content: `Ticket ${ticketId} has been updated`,
//       };
//       await rabbitmqUtil._sendMessage(queue, message);
//       console.log("A message is sent");
//       return updatedTicket;
//     })
//     .catch((err) => responseUtil._getErrorResponse(err, response))
//     .finally(() => responseUtil._sendReponse(res, response));
// };

const _findAndUpdateTicket = async function (
  ticketId,
  req,
  res,
  fillUpdateTicket
) {
  let response = responseUtil._initResponse();

  try {
    // Find the ticket by ID
    let ticket = await Ticket.findById(ticketId).exec();
    let foundTicket = responseUtil._checkExistedData(
      ticket,
      response,
      process.env.ERROR_TICKET_ID_NOT_FOUNT_MESSAGE
    );

    if (!foundTicket) {
      return responseUtil._sendReponse(res, response); // If ticket not found, exit early
    }

    // Fill ticket data with update
    let filledTicket = await fillUpdateTicket(foundTicket, req);

    // Update the ticket in the database
    let updatedTicket = await _updateOneTicket(filledTicket);

    // Send a success response
    responseUtil._getSuccessResponse(updatedTicket, response);

    // Send RabbitMQ message after the ticket is updated
    const queue = "ticket_notification";
    const message = {
      ticketId: ticketId,
      userId: updatedTicket.assignedTo,
      content: `Ticket ${ticketId} has been updated`,
    };

    // Send message to RabbitMQ
    await rabbitmqUtil._sendMessage(queue, message);
  } catch (err) {
    responseUtil._getErrorResponse(err, response);
  } finally {
    responseUtil._sendReponse(res, response);
  }
};

const _updateOneTicket = function (ticket) {
  return ticket.save();
};

const getTotal = function (req, res) {
  let response = responseUtil._initResponse();
  Ticket.find()
    .count()
    .then((total) => responseUtil._getSuccessResponse(total, response))
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

module.exports = {
  getAll,
  getOne,
  createOne,
  updateOne,
  updatePartialOne,
  deleteOne,
  getTotal,
};
