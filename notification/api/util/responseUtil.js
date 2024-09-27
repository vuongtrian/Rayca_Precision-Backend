// const bcrypt = require("bcrypt");

const _getDeleteSuccessResponse = function (message, res) {
  res.status = parseInt(process.env.HTTP_DELETE_STATUS_CODE);
  res.message = message;
};

const _getSuccessResponse = function (message, res) {
  res.status = parseInt(process.env.HTTP_SUCCESS_STATUS_CODE);
  res.message = message;
};

const _getErrorResponse = function (message, res) {
  res.status = parseInt(process.env.HTTP_INTERNAL_ERROR_STATUS_CODE);
  res.message = message;
};

const _getNotFoundResponse = function (message, res) {
  res.status = parseInt(process.env.HTTP_NOT_FOUND_STATUS_CODE);
  res.message = message;
};

const _initResponse = function () {
  return {
    status: parseInt(process.env.HTTP_SUCCESS_STATUS_CODE),
    message: {},
  };
};

const _getForbiddenErrorResponse = function () {
  return {
    status: parseInt(process.env.HTTP_FORBIDDEN_ERROR_STATUS_CODE),
    message: process.env.ERROR_NOT_TOKEN_PROVIDED,
  };
};

const _getSuccesAndNotFoundReponse = function (data, message, res) {
  if (data) {
    _getSuccessResponse(data, res);
  } else {
    _getNotFoundResponse(message, res);
  }
};

const _checkExistedData = function (data, response, message) {
  return new Promise((resolve, reject) => {
    if (data) {
      resolve(data);
    } else {
      response.status = parseInt(process.env.HTTP_NOT_FOUND_STATUS_CODE);
      reject(message);
    }
  });
};

const _checkExistedActor = function (data, userId, response, message) {
  const user = data.actors.id(userId);
  return new Promise((resolve, reject) => {
    if (user) {
      resolve(data);
    } else {
      response.status = parseInt(process.env.HTTP_NOT_FOUND_STATUS_CODE);
      reject(message);
    }
  });
};

const _sendReponse = function (res, response) {
  res.status(response.status).json(response.message);
};

const _sendReponseWithStatusAndMessage = function (res, status, message) {
  res.status(status).json(message);
};

module.exports = {
  _initResponse,
  _getNotFoundResponse,
  _getErrorResponse,
  _getSuccessResponse,
  _getDeleteSuccessResponse,
  _getSuccesAndNotFoundReponse,
  _checkExistedData,
  _sendReponse,
  _checkExistedActor,
  _sendReponseWithStatusAndMessage,
  _getForbiddenErrorResponse,
};
