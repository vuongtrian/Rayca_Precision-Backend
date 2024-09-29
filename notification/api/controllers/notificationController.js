const mongoose = require("mongoose");
const callbackify = require("util").callbackify;
const responseUtil = require("../util/responseUtil");
const userResponseUtil = require("../util/userResponseUtil");
const sendGridUtil = require("../util/sendGridUtil");

const Notification = mongoose.model(process.env.NOTIFICATION_MODEL);

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

  Notification.find(query)
    .skip(offset)
    .limit(count)
    .exec()
    .then((notifications) =>
      responseUtil._getSuccessResponse(notifications, response)
    )
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

const createOne = async function (req, res) {
  try {
    const userResponse = await userResponseUtil._getUserById(req.userId);
    const userNotificationReferenceResponse =
      userResponse.notificationPreferences;

    for (const type in userNotificationReferenceResponse) {
      if (userNotificationReferenceResponse[type] === true) {
        let newNotification = {
          userId: req.userId,
          ticketId: req.ticketId,
          type: type,
          message: req.message,
        };

        let response = responseUtil._initResponse();

        await Notification.create(newNotification)
          .then((newNotification) =>
            responseUtil._getSuccessResponse(newNotification, response)
          )
          .catch((err) => responseUtil._getErrorResponse(err, response))
          .finally(() => responseUtil._sendReponse(res, response));

        // Check if the notification type is email => send email to user
        /**
        if (type === "email") {
          const subject = `${req.message}`;
          const text = `The ticket ID #${req.ticketId} is assigned to you.`;
          const html = `<p>You can find the ticket ID <strong>${req.ticketId}</strong> details in Ticket Management system.</p>`;

          try {
            await sendGridUtil.sendEmail(
              `${userResponse.email}`,
              subject,
              text,
              html
            );
            console.log(
              `Email sent successfully to ${userResponse.name} via email ${userResponse.email}.`
            );
          } catch (emailError) {
            console.error("Error sending email notification:", emailError);
          }
        }
           */
      }
    }
  } catch (error) {
    console.error("Error in creating notification:", error);
    return responseUtil._sendReponseWithStatusAndMessage(
      res,
      500,
      "Error in fetching user data"
    );
  }
};

const getOne = function (req, res) {
  let notificationId = req.params.notificationId;
  let response = responseUtil._initResponse();
  Notification.findById(notificationId)
    .exec()
    .then((notification) =>
      responseUtil._checkExistedData(
        notification,
        response,
        process.env.ERROR_NOTIFICATION_ID_NOT_FOUNT_MESSAGE
      )
    )
    .then((foundNotification) =>
      responseUtil._getSuccessResponse(foundNotification, response)
    )
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

const getTotal = function (req, res) {
  let response = responseUtil._initResponse();
  Notification.find()
    .count()
    .then((total) => responseUtil._getSuccessResponse(total, response))
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

module.exports = {
  getAll,
  getOne,
  createOne,
  getTotal,
};
