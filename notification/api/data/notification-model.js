const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tickets",
    required: true,
  },
  type: {
    type: String,
    enum: ["email", "websocket", "sms"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

mongoose.model(
  process.env.NOTIFICATION_MODEL,
  notificationSchema,
  process.env.NOTIFICATIONS_COLLECTION
);
