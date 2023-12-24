const express = require("express");
const userModel = require("../models/userModel");
const cartModel = require("../models/cartModel");
const couponModel = require("../models/couponModel");
const orderModel = require("../models/orderModel");
const addressModel = require("../models/addressModel");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const APIFeatures = require("../utils/apiFeatures");
const reviewModel = require("../models/reviewModel");
const intermediaryClientModel = require("../models/intermediaryClientModel");
const quoteModel = require("../models/quoteModel");

const sendData = (user, statusCode, res) => {
  const token = user.getJWTToken();

  res.status(statusCode).json({
    user,
    token,
  });
};

exports.register = catchAsyncError(async (req, res, next) => {
  console.log("user register", req.body);

  const { firstname, lastname, mobile_no, email, password, refer_code } =
    req.body;

  const user = await userModel.create({
    firstname,
    lastname,
    email,
    password,
    mobile_no,
  });

  if (refer_code) {
    console.log(refer_code);
    await couponModel.create({ user: refer_code });
    await couponModel.create({ user: user._id });
  }

  await cartModel.create({
    user: user._id,
    items: [],
  });
  sendData(user, 200, res);
});

exports.getMyCoupon = catchAsyncError(async (req, res, next) => {
  console.log("my coupons", req.userId);
  const userId = req.userId;
  const coupons = await couponModel.find({ user: userId });
  res.status(200).json({ coupons });
});

exports.login = catchAsyncError(async (req, res, next) => {
  console.log("user login", req.body);
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please enter your email and password", 400));

  const user = await userModel
    .findOne({
      $or: [
        {
          email: email,
        },
        {
          mobile_no: email,
        },
      ],
    })
    .select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid email or password!", 401));

  sendData(user, 200, res);
});

exports.getProfile = catchAsyncError(async (req, res, next) => {
  console.log("user profile", req.userId);

  const user = await userModel.findById(req.userId);
  if (!user) {
    return next(new ErrorHandler("User not found.", 400));
  }

  res.status(200).json({
    user,
  });
});

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const { firstname, lastname, mobile_no } = req.body;

  const user = await userModel.findByIdAndUpdate(
    req.userId,
    { firstname, lastname, mobile_no },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    user,
  });
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const userId = req.userId;
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword)
    return next(
      new ErrorHandler("Password or Confirm Password is required.", 400)
    );

  if (password !== confirmPassword)
    return next(new ErrorHandler("Please confirm your password,", 400));

  const user = await userModel.findOne({ _id: userId });

  if (!user) return new ErrorHandler("User Not Found.", 404);

  user.password = password;
  await user.save();
  res.status(203).json({ message: "Password Updated Successfully." });
});

// admin
exports.adminLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  console.log("admin login", { email, password });

  if (!email || !password)
    return next(new ErrorHandler("Please enter your email and password", 400));

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email or password", 401));

  if (user.role !== "admin")
    return next(new ErrorHandler("Unauthorized user login.", 401));

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid email or password!", 401));

  sendData(user, 200, res);
});

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const userCount = await userModel.countDocuments();

  let query = {};
  if (req.query.role) {
    query = {
      role: {
        $regex: req.query.role,
        $options: "i",
      },
    };
  }
  if (req.query.role !== "all") {
    query.role = req.query.role;

    const apiFeature = new APIFeatures(
      userModel.find(query).sort({ createdAt: -1 }),
      req.query
    );

    let users = await apiFeature.query;
    let filteredUserCount = users.length;

    apiFeature.pagination();

    users = await apiFeature.query.clone();

    return res.status(200).json({ users, userCount, filteredUserCount });
  }

  const apiFeature = new APIFeatures(
    userModel.find().sort({ createdAt: -1 }),
    req.query
  ).search("firstname");

  let users = await apiFeature.query;
  let filteredUserCount = users.length;
  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    users = await apiFeature.query.clone();
  }
  res.status(200).json({ users, userCount, filteredUserCount });
});

exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findOne({ _id: id });

  console.log(user);

  if (!user) {
    return next(new ErrorHandler("User Not found", 404));
  }

  const cart = await cartModel.findOne({ user: user._id });
  await cart.remove();
  await orderModel.deleteMany({ userId: id });
  await addressModel.deleteMany({ user: id });
  await reviewModel.deleteMany({ user: id });
  await couponModel.deleteMany({ user: id });
  await user.remove();

  res.status(200).json({
    message: "User Deleted Successfully.",
  });
});

exports.updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { firstname, lastname, mobile_no, fax, role } = req.body;

  const user = await userModel.findById(id);
  if (!user) return next(new ErrorHandler("User not found.", 404));

  user.firstname = firstname;
  user.lastname = lastname;
  user.mobile_no = mobile_no;
  user.fax = fax;
  user.role = role;
  await user.save();

  res.status(200).json({
    user,
  });
});

exports.getUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findById(id);

  if (!user) return next(new ErrorHandler("User not found.", 404));

  res.status(200).json({ user });
});

// intermediary
exports.intermediaryLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please enter your email and password", 400));

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email or password", 401));

  if (user.role !== "intermediary")
    return next(new ErrorHandler("Unauthorized user login.", 401));

  console.log(password);

  const isPasswordMatched = await user.comparePassword(password);

  console.log(isPasswordMatched);

  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid email or password!", 401));

  sendData(user, 200, res);
});

exports.getAllClients = catchAsyncError(async (req, res, next) => {
  const clientCount = await intermediaryClientModel.countDocuments();
  console.log("clientCount", clientCount);

  const apiFeature = new APIFeatures(
    intermediaryClientModel
      .find({
        intermediary: req.userId,
      })
      .populate("user")
      .sort({ createdAt: -1 }),
    req.query
  ).search("firstname");

  let users = await apiFeature.query;

  let filteredClientCount = users.length;
  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    users = await apiFeature.query.clone();
  }

  res.status(200).json({
    users: users,
    clientCount,
    filteredClientCount,
  });
});

exports.getIntermeUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findById(id);

  if (!user) return next(new ErrorHandler("User not found.", 404));

  const intermediaryClient = await intermediaryClientModel.findOne({
    intermediary: req.userId,
  });

  const quotes = await quoteModel
    .find({
      user: id,
      // user: intermediaryClient.user,
    })
    .populate("user");

  res.status(200).json({ user, quotes });
});
