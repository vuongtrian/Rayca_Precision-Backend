const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resolutionTime: {
    hours: {
      type: Number,
      required: true,
      default: 0,
    },
    minutes: {
      type: Number,
      required: true,
      default: 0,
    },
    seconds: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  customerSatisfaction: {
    type: Number, // Rating from 1-5, for example
    min: 0,
    max: 5,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

mongoose.model(
  process.env.ANALYTIC_MODEL,
  analyticsSchema,
  process.env.ANALYTICS_COLLECTION
);
