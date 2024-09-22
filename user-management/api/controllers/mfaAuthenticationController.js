const responseUtil = require('../util/responseUtil');
const mongoose = require("mongoose");
const speakeasy = require("speakeasy");

const User = mongoose.model(process.env.USERS_MODEL);

const verify = function (req, res) {
  const user = req.user;
  console.log("User : " + JSON.stringify(req.user))
  const response = responseUtil._initResponse();
  let request = {
    secret: user.mfaSecret,
    encoding: process.env.MFA_ENCODING,
    token: req.body.token
  }

  let query = {
    username: user.username,
  };

  User.findOne(query)
      .exec()
      .then((foundUser) => responseUtil._verifyMFA(request, response, foundUser))
      .then(verified => responseUtil._getSuccessResponse(process.env.VERIFIED_MFA_SUCCESS_MESSAGE, response))
      .catch(err => responseUtil._getErrorResponse(process.env.VERIFIED_MFA_INVALID_MESSAGE, response))
      .finally(() => responseUtil._sendReponse(res, response))
}

module.exports = {
  verifyMFA: verify
}
