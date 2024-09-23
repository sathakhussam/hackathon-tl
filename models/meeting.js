const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Every meeting must have a meeting name"],
    },
    link: {
      type: String,
      required: [true, "Every meeting must have a link"],
    },
    createdOn: {
      type: Date,
      default: Date.now,
      required: [true, "Every meeting must have a link"],
    },
  },
  {
    versionKey: false, // You should be aware of the outcome after set to false
  }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = Meeting;
