const contactusModel = require("../models/contactusModel");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

exports.addContactus = catchAsyncError(async (req, res, next) => {
  const { firstname, lastname, email, mobile_no, topic, message } = req.body;

  if (mobile_no.length < 10) {
    return next(
      new ErrorHandler("Mobile must be atleast 10 characters long!", 401)
    );
  }

  const addContactus = await contactusModel.create({
    firstname,
    lastname,
    email,
    mobile_no,
    topic,
    message,
  });

  const savedContactus = await addContactus.save();

  res.status(200).json({ msg: "Query submitted!" });
});

exports.getAllContactus = catchAsyncError(async (req, res, next) => {
  const allContactus = await contactusModel.find();

  if (!allContactus) {
    return next(new ErrorHandler("No queries available to show.", 404));
  }

  res.status(200).json(allContactus);
});

exports.getContactus = catchAsyncError(async (req, res, next) => {
  const getContactus = await contactusModel.find({ _id: req.params.id });

  if (!getContactus) {
    return next(new ErrorHandler("Query not found!", 404));
  }

  res.status(200).json({ getContactus });
});

exports.deleteContactus = catchAsyncError(async (req, res, next) => {
  const contactus = await contactusModel.findById(req.params.id);

  if (!contactus) {
    return next(new ErrorHandler("Query not found!", 404));
  }

  await contactus.remove();

  res.status(200).json({ msg: "Query deleted!" });
});
