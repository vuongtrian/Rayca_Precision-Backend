const jwt = require("jsonwebtoken");
const { ac } = require("../acl/access-control");
const responseUtil = require("../util/responseUtil");

const authenticationController = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.SECRET_KEY_JWT, (err, user) => {
        if (err) {
          // Invalid or expired token
          const forbiddenResponse = responseUtil._getForbiddenErrorResponse();
          return responseUtil._sendReponseWithStatusAndMessage(
            res,
            forbiddenResponse.status,
            forbiddenResponse.message
          ); // Invalid or expired token
        }
        // console.log(user);
        req.user = user; // Attach the decoded token to the request object
        next();
      });
    } else {
      // No token provided
      const unauthorizedResponse = responseUtil._getUnauthoriedErrorResponse();
      return responseUtil._sendReponseWithStatusAndMessage(
        res,
        unauthorizedResponse.status,
        unauthorizedResponse.message
      );
    }
  },

  // Middleware to authorize based on the user's roles
  authorize: (action, resource) => {
    return (req, res, next) => {
      const roles = req.user.roles; // Extract roles from the JWT token

      let permissionGranted = false;

      // Check if any of the user's roles have permission for the requested action
      for (const role of roles) {
        const permission = ac.can(role)[action](resource);
        if (permission.granted) {
          permissionGranted = true;
          break; // Stop checking if one role grants permission
        }
      }

      if (permissionGranted) {
        next(); // Allow access if any role grants permission
      } else {
        // No permission and deny access
        const forbiddenResponse = responseUtil._getAccessDeniedResponse();
        return responseUtil._sendReponseWithStatusAndMessage(
          res,
          forbiddenResponse.status,
          forbiddenResponse.message
        );
      }
    };
  },
};

module.exports = authenticationController;
