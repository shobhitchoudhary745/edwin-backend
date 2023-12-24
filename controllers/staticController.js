const express = require("express");

const staticModel = require("../models/staticModel");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

exports.getStatic = catchAsyncError(async (req, res, next) => {
  const staticContent = await staticModel.findOne();

  if (!staticContent) {
    return next(new ErrorHandler("Content will be added soon!", 404));
  }

  res.status(200).json({ staticContent: staticContent });
});
