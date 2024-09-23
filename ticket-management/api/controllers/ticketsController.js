const mongoose = require("mongoose");
const callbackify = require("util").callbackify;
const responseUtil = require("../util/responseUtil");
const redisUtil = require("../data/redisUtil");
const Ticket = mongoose.model(process.env.TICKET_MODEL);

const getAll = function (req, res) {
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

  // redisUtil
  //   .getCache(req.body.cacheKey)
  //   .then((cacheValue) =>
  //     responseUtil._getSuccessResponse(cacheValue, response)
  //   )
  //   .catch((error) => responseUtil._getErrorResponse(error, response))
  //   .finally(() => responseUtil._sendReponse(res, response));
  // Ticket.find(query)
  //   .skip(offset)
  //   .limit(count)
  //   .exec()
  //   .then((tickets) => responseUtil._getSuccessResponse(tickets, response))
  //   .catch((err) => responseUtil._getErrorResponse(err, response))
  //   .finally(() => responseUtil._sendReponse(res, response));

  redisUtil
    .getCache(req.body.cacheKey)
    .then((cacheValue) => {
      if (cacheValue) {
        console.log("Serving from cache");
        responseUtil._getSuccessResponse(JSON.parse(cacheValue), response);
      } else {
        console.log("Serving from MongoDB");
        Ticket.find(query)
          .skip(offset)
          .limit(count)
          .exec()
          .then((tickets) => {
            redisUtil.setCache(req.body.cacheKey, tickets); // Use req.body.cacheKey
            return responseUtil._getSuccessResponse(tickets, response);
          })
          .catch((error) => responseUtil._getErrorResponse(error, response));
      }
    })
    .catch((error) => responseUtil._getErrorResponse(error, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

const createOne = function (req, res) {
  let newTicket = {
    title: req.body.title,
    description: req.body.description,
    status: req.body.status || "open",
    priority: req.body.priority || "medium",
    assignedTo: req.body.assignedTo,
    tags: req.body.tags || [],
  };

  let response = responseUtil._initResponse();

  Ticket.create(newTicket)
    .then((newTicket) => responseUtil._getSuccessResponse(newTicket, response))
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
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

const updateOne = function (req, res) {
  let ticketId = req.params.ticketId;
  _findAndUpdateTicket(ticketId, req, res, _fillFullUpdateTicket);
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

const _findAndUpdateTicket = function (ticketId, req, res, fillUpdateTicket) {
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
    .then((foundTicket) => fillUpdateTicket(foundTicket, req))
    .then((filledTicket) => _updateOneTicket(filledTicket))
    .then((updatedTicket) =>
      responseUtil._getSuccessResponse(updatedTicket, response)
    )
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
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
