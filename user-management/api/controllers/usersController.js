const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const responseUtil = require('../util/responseUtil');
const jwt = require('jsonwebtoken');
const util = require('util');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const {verify} = require("jsonwebtoken");

const User = mongoose.model(process.env.USERS_MODEL);

const addOne = function (req, res) {
  let newUser = User({
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
    roles: req.body.roles,
    email: req.body.email
  });
  if (_validateRequest(req)) {
    responseUtil._sendReponseWithStatusAndMessage(
      res,
      parseInt(process.env.HTTP_BAD_REQUEST_STATUS_CODE),
      process.env.ERROR_LOGIN_USER
    );
    return;
  }
  const response = responseUtil._initResponse();
  bcrypt
    .genSalt(parseInt(process.env.DEFAULT_SALT_ROUND))
    .then((salt) => _generateHash(newUser.password, salt))
    .then((passwordHash) => _fillPassword(passwordHash, newUser))
    .then((hashUser) => _saveUser(hashUser))
    .then((savedUser) => responseUtil._getSuccessResponse(savedUser, response))
    .catch((error) => responseUtil._getErrorResponse(error, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

const login = function (req, res) {
  const response = responseUtil._initResponse();
  let query = {
    username: req.body.username,
  };
  if (_validateRequest(req)) {
    responseUtil._sendReponseWithStatusAndMessage(
      res,
      parseInt(process.env.HTTP_BAD_REQUEST_STATUS_CODE),
      process.env.ERROR_LOGIN_USER
    );
    return;
  }
  User.findOne(query)
    .exec()
    .then(foundUser => responseUtil._checkExistedData(foundUser, response, process.env.ERROR_FIND_USER))
    .then((existedUser) => responseUtil._checkPasswordUser(existedUser, req.body.password))
    .then((verifiedUser) => _generateToken(verifiedUser))
    .then((token) => responseUtil._getTokenSuccessResponse(token, response))
    .catch((err) => responseUtil._getErrorResponse(err, response))
    .finally(() => responseUtil._sendReponse(res, response));
};

const enableMFA = function (req, res) {
  const response = responseUtil._initResponse();
  const secret = _generateSecret(req);
  console.log(secret.base32);
  let query = {
    mfaSecret: secret.base32,
    mfaEnabled: true
  }

  User.findByIdAndUpdate(req.body.id, query)
      .exec()
      .then((updatedUser) =>_generateQrCode(secret))
      .then(generatedQrCode => responseUtil._getSuccessResponse(generatedQrCode, response))
      .catch(error => responseUtil._getErrorResponse(error, response))
      .finally(() => responseUtil._sendReponse(res, response));
}

const testAuthorization = function (req, res)  {
  responseUtil._sendReponseWithStatusAndMessage(
      res,
      parseInt(process.env.HTTP_BAD_REQUEST_STATUS_CODE),
      process.env.ERROR_LOGIN_USER
  );
}

const _validateRequest = function (req) {
  return !(req.body && req.body.username && req.body.password);
};

const _fillPassword = function (passwordHash, newUser) {
  newUser.password = passwordHash;
  return new Promise((resolve) => {
    resolve(newUser);
  });
};

const _saveUser = function (user) {
  return user.save();
};

const _generateHash = function (password, salt) {
  return bcrypt.hash(password, salt);
};

const _generateToken = function (dbUser) {
  const sign = util.promisify(jwt.sign);
  return sign({ username: dbUser.username, roles: dbUser.roles}, process.env.SECRET_KEY_JWT, {
    expiresIn: parseInt(process.env.EXPIRED_TIME_JWT),
  });
};

const _generateSecret = function (req) {
  return speakeasy.generateSecret({ name: process.env.SECRET_KEY_MFA + req.user.username });
}

const _generateQrCode = function (secret) {
  return qrcode.toDataURL(secret.otpauth_url);
}

module.exports = {
  register: addOne,
  login,
  enableMFA: enableMFA,
  testAuthorization
};
