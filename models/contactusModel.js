const mongoose = require("mongoose");

const contactusSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Please enter firstname."],
    },
    lastname: {
      type: String,
      required: [true, "Please enter lastname."],
    },
    email: {
      type: String,
      required: [true, "Please enter email."],
    },
    mobile_no: {
      type: String,
      required: [true, "Please enter mobile."],
    },
    topic: {
      type: String,
      required: [true, "Please select one topic."],
    },
    message: {
      type: String,
      required: [true, "Please enter your message."],
    },
  },
  { timestamps: true }
);

const contactusModel = mongoose.model("contactus", contactusSchema);

module.exports = contactusModel;
