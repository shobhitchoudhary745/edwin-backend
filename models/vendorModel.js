const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please enter name for the vendor"],
    },
    email: {
      type: String,
      required: [true, "Please enter email for vendor"],
    },
    mobile_no: {
      type: String,
      required: [true, "Please enter mobile number for vendor"],
    },
  },
  { timestamps: true }
);

const venderModel = mongoose.model("vender", vendorSchema);

module.exports = venderModel;
