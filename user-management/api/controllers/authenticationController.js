const jwt = require('jsonwebtoken');
const util = require('util');
const responseUtil = require('../util/responseUtil');

const authenticate = function (req, res, next) {
  const response = responseUtil._getForbiddenErrorResponse();

  const headerExists = req.headers.authorization;
  if (headerExists) {
    const token = req.headers.authorization.split(process.env.SPACE)[1];
    const verify = util.promisify(jwt.verify);

    verify(token, process.env.SECRET_KEY_JWT)
      .then((decodedToken) => responseUtil._verifiedUser(req, decodedToken, next))
      .catch((err) => responseUtil._sendReponseWithStatusAndMessage(res, process.env.HTTP_FORBIDDEN_ERROR_STATUS_CODE, process.env.ERROR_TOKEN_EXPIRED))
  } else {
    responseUtil._sendReponse(res, response);
  }
};

module.exports = {
  authenticate
};
