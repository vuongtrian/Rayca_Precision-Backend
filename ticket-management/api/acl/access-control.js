const AccessControl = require("accesscontrol");
const ac = new AccessControl();

/**
 * Permissions for 'user'
 *  - Can read, update all tickets
 *  - Can NOT create, delete any ticket
 */
ac.grant(process.env.USER_ROLE)
  .readAny(process.env.RESOURCE_PROFILE)
  .updateAny(process.env.RESOURCE_PROFILE);

/**
 * Permissions for 'manager' : full permission
 */
ac.grant(process.env.MANAGER_ROLE)
  .extend(process.env.USER_ROLE)
  .createAny(process.env.RESOURCE_PROFILE)
  .deleteAny(process.env.RESOURCE_PROFILE);

/**
 * Permissions for 'admin' :
 *  - Can read any tickets
 *  - Can NOT create, update, delete ticket
 */
ac.grant(process.env.ADMIN_ROLE)
  .extend(process.env.USER_ROLE)
  .updateAny(process.env.RESOURCE_PROFILE, []);

module.exports = { ac };
