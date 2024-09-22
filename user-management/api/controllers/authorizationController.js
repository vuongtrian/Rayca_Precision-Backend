const responseUtil = require('../util/responseUtil');
const accessControl = require('../acl/access-control')

const _checkAuthorization = function (action, resource) {
  const response = responseUtil._getAccessDeniedResponse();

  return (req, res, next) => {
    const permission =  accessControl.ac.can(req.user.roles)[action](resource);
    responseUtil._checkPermission(permission, response)
        .then((authorizedUser) => next())
        .catch((err) => responseUtil._sendReponseWithStatusAndMessage(res, response.status, process.env.ERROR_ACCESS_DENIED))

  };
};

module.exports = {
  authorize: _checkAuthorization
};
