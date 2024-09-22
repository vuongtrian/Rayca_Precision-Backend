const AccessControl = require('accesscontrol');
const ac = new AccessControl();

ac.grant(process.env.USER_ROLE)
    .readOwn(process.env.RESOURCE_PROFILE)
    .updateOwn(process.env.RESOURCE_PROFILE);

ac.grant(process.env.MANAGER_ROLE)
    .extend(process.env.USER_ROLE)
    .readAny(process.env.RESOURCE_PROFILE);

ac.grant(process.env.ADMIN_ROLE)
    .extend(process.env.MANAGER_ROLE)
    .updateAny(process.env.RESOURCE_PROFILE)
    .deleteAny(process.env.RESOURCE_PROFILE);

module.exports = {
    ac: ac
};
