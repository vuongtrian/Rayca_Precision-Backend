const mongoose = require("mongoose");
const callbackify = require("util").callbackify;
const responseUtil = require("../util/responseUtil");

const Analytic = mongoose.model(process.env.ANALYTIC_MODEL);

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

  Analytic.find(query)
    .skip(offset)
    .limit(count)
    .exec()
    .then((notifications) =>
      responseUtil._getSuccessResponse(notifications, response)
    )
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

const createOne = function (req, res) {
  let newAnalytic = {
    ticketId: req.ticketId,
    userId: req.userId,
    resolutionTime: req.resolutionTime,
  };

  let response = responseUtil._initResponse();

  Analytic.create(newAnalytic)
    .then((newAnalytic) =>
      responseUtil._getSuccessResponse(newAnalytic, response)
    )
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

const getOne = function (req, res) {
  let analyticId = req.params.analyticId;
  let response = responseUtil._initResponse();
  Movie.findById(analyticId)
    .exec()
    .then((analytic) =>
      responseUtil._checkExistedData(
        analytic,
        response,
        process.env.ERROR_ANALYTIC_ID_NOT_FOUNT_MESSAGE
      )
    )
    .then((foundAnalytic) =>
      responseUtil._getSuccessResponse(foundAnalytic, response)
    )
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

const updateCustomerSatisfaction = function (req, res) {
  let analyticId = req.params.analyticId;
  _findAndUpdateAnalytic(analyticId, req, res, _fillPartialUpdateAnalytic);
};

const _fillPartialUpdateAnalytic = function (analytic, req) {
  if (req.body.customerSatisfaction) {
    analytic.customerSatisfaction = req.body.customerSatisfaction;
  }
  return new Promise((resolve) => {
    resolve(movie);
  });
};

const _findAndUpdateAnalytic = function (
  analyticId,
  req,
  res,
  fillUpdateAnalytic
) {
  let response = responseUtil._initResponse();
  Analytic.findById(analyticId)
    .exec()
    .then((analytic) =>
      responseUtil._checkExistedData(
        analytic,
        response,
        process.env.ERROR_ANALYTIC_ID_NOT_FOUNT_MESSAGE
      )
    )
    .then((foundAnalytic) => fillUpdateAnalytic(foundAnalytic, req))
    .then((filledAnalytic) => _updateOneAnalytic(filledAnalytic))
    .then((updatedAnalytic) =>
      responseUtil._getSuccessResponse(updatedAnalytic, response)
    )
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

const _updateOneAnalytic = function (analytic) {
  return analytic.save();
};

const getTotal = function (req, res) {
  let response = responseUtil._initResponse();
  Analytic.find()
    .count()
    .then((total) => responseUtil._getSuccessResponse(total, response))
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

module.exports = {
  getAll,
  getOne,
  createOne,
  updateCustomerSatisfaction,
  getTotal,
};
