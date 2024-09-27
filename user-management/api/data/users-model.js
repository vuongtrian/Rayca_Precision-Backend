const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  roles: [
    {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },
  ],
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true,
    },
    websocket: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: false,
    },
  },

  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: {
    type: String,
  },
});

mongoose.model(
  process.env.USERS_MODEL,
  userSchema,
  process.env.USERS_COLLECTION
);
