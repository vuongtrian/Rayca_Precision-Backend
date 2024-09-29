const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
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
  Analytic.findById(analyticId)
    .exec()
    .then((analytic) =>
      responseUtil._checkExistedData(
        analytic,
        response,
        process.env.ERROR_ANALYTIC_ID_NOT_FOUND_MESSAGE
      )
    )
    .then((foundAnalytic) =>
      responseUtil._getSuccessResponse(foundAnalytic, response)
    )
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

const updateCustomerSatisfaction = async function (req, res) {
  let analyticId = req.params.analyticId;
  await _findAndUpdateAnalytic(
    analyticId,
    req,
    res,
    _fillPartialUpdateAnalytic
  );
};

const _fillPartialUpdateAnalytic = function (analytic, req) {
  if (req.body.customerSatisfaction) {
    analytic.customerSatisfaction = req.body.customerSatisfaction;
  }
  return new Promise((resolve) => {
    resolve(analytic);
  });
};

const _findAndUpdateAnalytic = async function (
  analyticId,
  req,
  res,
  fillUpdateAnalytic
) {
  let response = responseUtil._initResponse();

  try {
    // Find the analytic ID
    let analytic = await Analytic.findById(analyticId).exec();

    // Use `await` to handle _checkExistedData promise
    let foundAnalytic = await responseUtil._checkExistedData(
      analytic,
      response,
      process.env.ERROR_ANALYTIC_ID_NOT_FOUND_MESSAGE
    );

    // Fill ticket data with update
    let filledAnalytic = await fillUpdateAnalytic(foundAnalytic, req);
    console.log(filledAnalytic);
    // Update the analytic in the database
    let updatedAnalytic = await _updateOneAnalytic(filledAnalytic);
    console.log(updatedAnalytic);

    // Send a success response
    responseUtil._getSuccessResponse(updatedAnalytic, response);
  } catch (err) {
    responseUtil._getErrorResponse(err, response);
  } finally {
    responseUtil._sendReponse(res, response);
  }
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

const getAnalyticsByUserId = async function (req, res) {
  const userId = new ObjectId(req.params.userId);

  try {
    const result = await Analytic.aggregate([
      // Match documents by userId
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId), // Ensure userId is cast as ObjectId
        },
      },
      // Group by userId and calculate the total tickets and average resolution time
      {
        $group: {
          _id: "$userId",
          totalTicketsResolved: { $sum: 1 },
          avgHours: { $avg: "$resolutionTime.hours" },
          avgMinutes: { $avg: "$resolutionTime.minutes" },
          avgSeconds: { $avg: "$resolutionTime.seconds" },
          avgCustomerSatisfaction: { $avg: "$customerSatisfaction" },
        },
      },
      // Project the final result (optional)
      {
        $project: {
          _id: 0, // Hide the _id field
          userId: "$_id",
          totalTicketsResolved: 1,
          avgResolutionTime: {
            hours: "$avgHours",
            minutes: "$avgMinutes",
            seconds: "$avgSeconds",
          },
          avgCustomerSatisfaction: "$avgCustomerSatisfaction",
        },
      },
    ]);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No analytics found for this user." });
    }

    return res.status(200).json(result[0]);
  } catch (err) {
    console.error("Error in fetching analytics by userId:", err);
    return res.status(500).json({ message: "Error in fetching analytics" });
  }
};

module.exports = {
  getAll,
  getOne,
  createOne,
  updateCustomerSatisfaction,
  getTotal,
  getAnalyticsByUserId,
};
