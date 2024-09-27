const axios = require("axios");

const _getUserNotificationReferenceById = async function (userId) {
  try {
    const userResponse = await axios.get(
      `http://localhost:3100/api/users/${userId}`
    );
    return userResponse.data.notificationPreferences;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error.message);
    throw new Error("User not found");
  }
};

module.exports = {
  _getUserNotificationReferenceById,
};
