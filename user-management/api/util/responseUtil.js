const bcrypt = require('bcrypt');
const speakeasy = require("speakeasy");

const _getDeleteSuccessResponse = function (message, res) {
  res.status = parseInt(process.env.HTTP_DELETE_STATUS_CODE);
  res.message = message;
};

const _getSuccessResponse = function (message, res) {
  res.status = parseInt(process.env.HTTP_SUCCESS_STATUS_CODE);
  res.message = message;
};

const _getErrorResponse = function (message, res) {
  console.log(message);
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

const _getAccessDeniedResponse = function () {
  return {
    status: parseInt(process.env.HTTP_FORBIDDEN_ERROR_STATUS_CODE),
    message: process.env.ERROR_ACCESS_DENIED,
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

const _checkExistedActor = function (data, actorId, response, message) {
  const actor = data.actors.id(actorId);
  return new Promise((resolve, reject) => {
    if (actor) {
      resolve(data);
    } else {
      response.status = parseInt(process.env.HTTP_NOT_FOUND_STATUS_CODE);
      reject(message);
    }
  });
};
const _verifiedUser = function (req, verifiedUser, next) {
   req.user = verifiedUser;
   next();
}
const _sendReponse = function (res, response) {
  res.status(response.status).json(response.message);
};

const _sendReponseWithStatusAndMessage = function (res, status, message) {
  res.status(status).json(message);
};

const _checkPasswordUser = function (dbUser, password) {
  return new Promise((resolve, reject) => {
    bcrypt
      .compare(password, dbUser.password)
      .then((salt) => _checkSaltPasswordMatching(salt, dbUser))
      .then((verifiedUser) => resolve(verifiedUser))
      .catch((err) => reject(err));
  });
};

const _checkMFAEnabled = function (existedUser) {
  const mfaEnabled = existedUser.mfaEnabled;
  return new Promise((resolve, reject) => {
    if(mfaEnabled) {
      resolve(existedUser);
    } else {
      reject(existedUser);
    }
  });
}

const _checkPermission = function (data, response) {
  const permission = data.granted;
  return new Promise((resolve, reject) => {
    if (permission) {
      resolve(data);
    } else {
      response.status = parseInt(process.env.HTTP_FORBIDDEN_ERROR_STATUS_CODE);
      reject(process.env.ERROR_ACCESS_DENIED);
    }
  });
};

const _verifyMFA = function (request, response, foundUser) {
  request.secret = foundUser.mfaSecret;
  const verified = speakeasy.totp.verify(request);
  console.log(verified);
  return new Promise((resolve, reject) => {
    if (verified) {
      resolve(foundUser);
    } else {
      response.status = parseInt(process.env.HTTP_FORBIDDEN_ERROR_STATUS_CODE);
      reject(process.env.ERROR_NOT_TOKEN_PROVIDED);
    }
  });
};

const _getTokenSuccessResponse = function (token, response) {
  response.status = parseInt(process.env.HTTP_SUCCESS_STATUS_CODE);
  response.message = { [process.env.TOKEN]: token };
};

const _checkSaltPasswordMatching = function (salt, dbUser) {
  return new Promise((resolve, reject) => {
    if (salt) {
      resolve(dbUser);
    } else {
      reject(process.env.ERROR_PASSWORD_NOT_MATCHED);
    }
  });
};

module.exports = {
  _initResponse,
  _getNotFoundResponse,
  _getErrorResponse,
  _getSuccessResponse,
  _getDeleteSuccessResponse,
  _getSuccesAndNotFoundReponse,
  _getAccessDeniedResponse,
  _checkExistedData,
  _sendReponse,
  _sendReponseWithStatusAndMessage,
  _checkPasswordUser,
  _getTokenSuccessResponse,
  _getForbiddenErrorResponse,
  _checkExistedActor,
  _checkPermission,
  _verifiedUser,
  _verifyMFA,
  _checkMFAEnabled
};
