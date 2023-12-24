const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // firstname: {
    //   type: String,
    //   required: [true, "Please enter firstname."],
    // },
    // lastname: {
    //   type: String,
    //   required: [true, "Please enter lastname."],
    // },
    // email: {
    //   type: String,
    //   required: [true, "Please enter email."],
    // },
    // mobile_no: {
    //   type: String,
    //   required: [true, "Please enter your mobile number."],
    // },
    role: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: [true, "Please enter your service requirement details."],
    },
    quoteStatus: {
      type: String,
      default: "new",
      enum: ["new", "pending", "closed"],
    },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "finalized"],
    },
    quoteDoc: {
      type: String,
    },
  },
  { timestamps: true }
);

const quoteModel = mongoose.model("quotes", quoteSchema);

module.exports = quoteModel;
