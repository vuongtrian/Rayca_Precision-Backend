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
    type: Number, // Time in hours or minutes it took to resolve the ticket
    required: true,
  },
  customerSatisfaction: {
    type: Number, // Rating from 1-5, for example
    min: 0,
    max: 5,
    default: 0,
  },

  // performanceMetrics: {
  //   ticketsResolved: {
  //     type: Number, // Total tickets resolved by agent
  //     default: 0,
  //   },
  //   averageResolutionTime: {
  //     type: Number, // Average time in hours or minutes
  //     default: 0,
  //   },
  // },
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
