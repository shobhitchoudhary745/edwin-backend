const orderModel = require("../models/orderModel");
const crypto = require("crypto");
const {
  categoryModel,
  subCategoryModel,
  productModel,
} = require("../models/productModel");
const userModel = require("../models/userModel");
const staticModel = require("../models/staticModel");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { s3Uploadv2, s3UploadMulti } = require("../utils/s3");
const installerModel = require("../models/installersModel");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const APIFeatures = require("../utils/apiFeatures");
const intermediaryClientModel = require("../models/intermediaryClientModel");
const venderModel = require("../models/vendorModel");
const { default: mongoose } = require("mongoose");
const cartModel = require("../models/cartModel");
const addressModel = require("../models/addressModel");
const reviewModel = require("../models/reviewModel");

exports.postSingleImage = catchAsyncError(async (req, res, next) => {
  const file = req.file;
  if (!file) return next(new ErrorHandler("Invalid Image", 401));

  const results = await s3Uploadv2(file);
  const location = results.Location && results.Location;
  return res.status(201).json({ data: { location } });
});

exports.postMultipleImages = catchAsyncError(async (req, res, next) => {
  const files = req.files;
  if (files) {
    const results = await s3UploadMulti(files);
    console.log(results);
    let location = [];
    results.filter((result) => {
      location.push(result.Location);
    });
    return res.status(201).json({ data: { location } });
  } else {
    return next(new ErrorHandler("Invalid Image", 401));
  }
});

exports.getAll = catchAsyncError(async (req, res, next) => {
  const { product } = req.query;
  const categories = await categoryModel.find();
  const subCategories = await subCategoryModel.find();
  let products;
  if (product) products = await productModel.find();

  res.status(200).json({ categories, subCategories, products });
});

exports.getStatistics = catchAsyncError(async (req, res, next) => {
  const { time } = req.params;
  const date = new Date();
  date.setHours(24, 0, 0, 0);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  let startDate = new Date(date.getFullYear(), 0, 1);
  var days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
  var week = Math.ceil(days / 7);

  const intermediaries = await userModel
    .find({ role: "intermediary" })
    .countDocuments();

  if (time == "all") {
    const users = await userModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const orders = await orderModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const payments = await orderModel.aggregate([
      {
        $project: {
          amount: 1,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const quantity = await orderModel.aggregate([
      {
        $project: {
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);
    const dailyUsers = await userModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyOrders = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyQuantity = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyPayments = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          amount: 1,
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      intermediaries: intermediaries,
      payments: payments,
      orders: orders,
      quantity: quantity,
      dailyUsers,
      dailyOrders,
      dailyQuantity,
      dailyPayments,
    });
  }
  if (time == "daily") {
    const users = await userModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const orders = await orderModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const payments = await orderModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const quantity = await orderModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
            ],
          },
        },
      },
      {
        $addFields: {
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);
    const dailyUsers = await userModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 6 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyOrders = await orderModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 6 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyPayments = await orderModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 6 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyQuantity = await orderModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 6 } },
            ],
          },
        },
      },
      {
        $addFields: {
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      payments: payments,
      orders: orders,
      quantity: quantity,
      dailyUsers,
      dailyOrders,
      dailyPayments,
      dailyQuantity,
    });
  }
  if (time == "weekly") {
    const users = await userModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          week: week,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const payments = await orderModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
          amount: 1,
        },
      },
      {
        $match: {
          year: year,
          week: week,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const orders = await orderModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          week: week,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const quantity = await orderModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $match: {
          year: year,
          week: week,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);
    const dailyUsers = await userModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyOrders = await orderModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyQuantity = await orderModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: "quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyPayments = await orderModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
          amount: 1,
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      payments: payments,
      orders: orders,
      quantity: quantity,
      dailyUsers,
      dailyOrders,
      dailyQuantity,
      dailyPayments,
    });
  }
  if (time == "monthly") {
    const users = await userModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          month: month,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const orders = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          month: month,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const payments = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          amount: 1,
        },
      },
      {
        $match: {
          year: year,
          month: month,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const quantity = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $match: {
          year: year,
          month: month,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);
    const dailyUsers = await userModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyOrders = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyQuantity = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          quantity: { $sum: "$products.quantity" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyPayments = await orderModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          amount: 1,
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      payments: payments,
      orders: orders,
      quantity: quantity,
      dailyUsers,
      dailyOrders,
      dailyQuantity,
      dailyPayments,
    });
  }
});

exports.getInterPerClientInfo = catchAsyncError(async (req, res, next) => {
  const intermediaries = await userModel.find({ role: "intermediary" });

  res.status(200).json({ intermediaries: intermediaries });
});

exports.getIntermediariesInfo = catchAsyncError(async (req, res, next) => {});

exports.addStaticContent = catchAsyncError(async (req, res, next) => {
  const { aboutUs, contactUs } = req.body;

  const staticContent = await staticModel.create({
    aboutUs,
    contactUs: {
      phone: contactUs?.map((c) => c?.phone),
      email: contactUs?.map((c) => c?.email),
      address: contactUs?.map((c) => c?.address),
    },
  });

  const savedStaticContent = await staticContent.save();

  res.status(200).json(savedStaticContent);
});

exports.getStaticContent = catchAsyncError(async (req, res, next) => {
  const staticContents = await staticModel.find();

  res.status(200).json({ staticContents: staticContents });
});

exports.viewStaticContent = catchAsyncError(async (req, res, next) => {
  const staticContent = await staticModel.find({ _id: req.params.id });

  res.status(200).json(staticContent);
});

exports.updateStaticContent = catchAsyncError(async (req, res, next) => {
  const { aboutUs, contactUsPhone, contactUsEmail, contactUsAddr } = req.body;

  const staticContent = await staticModel.findByIdAndUpdate(
    req.params.id,
    {
      aboutUs,
      contactUs: {
        phone: contactUsPhone?.map((c) => c),
        email: contactUsEmail?.map((c) => c),
        address: contactUsAddr?.map((c) => c),
      },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(staticContent);
});

exports.addInstallers = catchAsyncError(async (req, res, next) => {
  const {
    company_name,
    contact_name,
    mobile,
    email,
    kvk_number,
    contact_name_lastname,
    number_of_installers,
    other_email,
    other_mobile,
    region_for_installation,
    primary_expertise,
    residence,
    extra_information,
    add_street,
    add_country,
    add_postcode,
    certifications,
    profilePic,
  } = req.body;

  const unique_id = uuidv4();
  const id = unique_id.slice(0, 6);

  // if (mobile.length < 10) {
  //   return next(
  //     new ErrorHandler("Mobile must be atleast 10 charcters long!", 401)
  //   );
  // }

  const oldInstaller = await installerModel.find({ email: email });
  const oldInstallerMobile = await installerModel.find({ mobile: mobile });
  if (oldInstaller.length > 0) {
    return next(
      new ErrorHandler("Installer already exists with the given email.", 409)
    );
  }

  if (oldInstallerMobile.length > 0) {
    return next(
      new ErrorHandler(
        "Installer already exists with the given mobile number.",
        409
      )
    );
  }

  // if (mobile.length < 10) {
  //   return next(ErrorHandler("Mobile must be atleast 10 charcters long!", 401));
  // }

  const installer = await installerModel.create({
    ID: `Edwin - ${id}`,
    company_name,
    contact_name,
    mobile,
    email,
    kvk_number,
    contact_name_lastname,
    number_of_installers,
    other_email,
    other_mobile,
    region_for_installation,
    primary_expertise,
    residence,
    extra_information,
    add_street,
    add_country,
    add_postcode,
    certifications,
    profilePic,
  });

  const savedInstaller = await installer.save();

  res.status(200).json(savedInstaller);
});

exports.getInstallers = catchAsyncError(async (req, res, next) => {
  const apiFeature = new APIFeatures(
    installerModel.find().sort({ createdAt: -1 }),
    req.query
  ).search("name");

  let installers = await apiFeature.query;

  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    installers = await apiFeature.query.clone();
  }

  // const installers = await installerModel.find();

  if (!installers) {
    return next(new ErrorHandler("No installers found!", 404));
  }

  res.status(200).json(installers);
});

exports.getInstaller = catchAsyncError(async (req, res, next) => {
  const installer = await installerModel.find({ _id: req.params.id });

  if (!installer) {
    return next(new ErrorHandler("No installer found!", 404));
  }

  res.status(200).json(installer);
});

exports.updateInstaller = catchAsyncError(async (req, res, next) => {
  const installer = await installerModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(installer);
});

exports.deleteInstaller = catchAsyncError(async (req, res, next) => {
  const installer = await installerModel.findById(req.params.id);

  await installer.remove();

  res.status(200).json({ msg: "Installer deleted!" });
});

exports.addIntermediary = catchAsyncError(async (req, res, next) => {
  const {
    residence,
    other_mobile,
    other_email,
    firstname,
    lastname,
    companyname,
    kvk_number,
    aanstellingovereenkomst,
    addional_contact_details,
    street_address,
    post_code,
    // city,
    country,
    // extra_contact_details,
    // extra_info_field,
    mobile_no,
    email,
    password,
  } = req.body;

  const intermediary = await userModel.create({
    firstname,
    lastname,
    companyname,
    kvk_number,
    appointmentAgreement: aanstellingovereenkomst,
    addional_contact_details,
    street_address,
    post_code,
    // city,
    country,
    // extra_contact_details,
    // extra_info_field,
    mobile_no,
    email,
    residence,
    other_mobile,
    other_email,
    password,
    role: "intermediary",
  });

  const savedintermediary = await intermediary.save();

  res.status(200).json(savedintermediary);
});

exports.getAllIntermediaries = catchAsyncError(async (req, res, next) => {
  const intermediaryCount = await userModel.countDocuments({
    role: "intermediary",
  });

  const apiFeature = new APIFeatures(
    userModel.find({ role: "intermediary" }).sort({ createdAt: -1 }),
    req.query
  ).search("firstname");

  let intermediaries = await apiFeature.query;
  let filteredIntermediaryCount = intermediaries.length;

  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    intermediaries = await apiFeature.query.clone();
  }

  // const intermediaries = await userModel.find({ role: "intermediary" });

  if (!intermediaries) {
    return next(new ErrorHandler("No intermediaries found!", 404));
  }

  res
    .status(200)
    .json({ intermediaries, filteredIntermediaryCount, intermediaryCount });
});

exports.getIntermediary = catchAsyncError(async (req, res, next) => {
  const intermediary = await userModel.findOne({
    _id: req.params.id,
    role: "intermediary",
  });

  const intermediaryClients = await intermediaryClientModel
    .findOne({ intermediary })
    .populate("user");

  if (!intermediary) {
    return next(new ErrorHandler("No intermediary found!", 404));
  }

  res
    .status(200)
    .json({ intermediary, intermediaryClients: intermediaryClients });
});

exports.updateIntermediary = catchAsyncError(async (req, res, next) => {
  const {
    companyname,
    firstname,
    lastname,
    residence,
    kvk_number,
    aanstellingovereenkomst,
    addional_contact_details,
    street_address,
    post_code,
    country,
    mobile_no,
    email,
    other_mobile,
    other_email,
    password,
  } = req.body;

  const intermediaryDetails = await userModel.findById(req.params.id);

  let encryptPw;
  if (password) {
    encryptPw = await bcrypt.hash(password, 11);
  } else {
    encryptPw = intermediaryDetails.password;
  }

  const intermediary = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      companyname,
      firstname,
      lastname,
      residence,
      kvk_number,
      aanstellingovereenkomst,
      addional_contact_details,
      street_address,
      post_code,
      country,
      mobile_no,
      email,
      other_mobile,
      other_email,
      password: encryptPw,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(intermediary);
});

exports.deleteIntermediary = catchAsyncError(async (req, res, next) => {
  const intermediary = await userModel.findById(req.params.id);

  const cart = await cartModel.findOne({ user: intermediary?._id });
  if (cart) {
    await cart.remove();
  }
  await orderModel.deleteMany({ userId: req.params.id });
  await addressModel.deleteMany({ user: req.params.id });
  await reviewModel.deleteMany({ user: req.params.id });

  await intermediary.remove();

  res.status(200).json({ msg: "Intermediary deleted!" });
});

exports.addVendor = catchAsyncError(async (req, res, next) => {
  const { fullname, mobile_no, email } = req.body;

  const vendor = await venderModel.create({
    email,
    fullname,
    mobile_no,
  });

  const savedVendor = await vendor.save();

  res.status(200).json({ savedVendor: savedVendor });
});

exports.getAllVendors = catchAsyncError(async (req, res, next) => {
  const vendorCount = await venderModel.countDocuments();

  const apiFeature = new APIFeatures(
    venderModel.find().sort({ createdAt: -1 }),
    req.query
  ).search("fullname");

  let vendors = await apiFeature.query;
  const filteredVendorCount = vendors.length;

  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    vendors = await apiFeature.query.clone();
  }

  // const vendors = await userModel.find({ role: "intermediary" });

  if (!vendors) {
    return next(new ErrorHandler("No vendors found!", 404));
  }

  res.status(200).json({
    vendors: vendors,
    vendorCount: vendorCount,
    filteredVendorCount: filteredVendorCount,
  });
});

exports.getVendor = catchAsyncError(async (req, res, next) => {
  const vendor = await venderModel.findOne({
    _id: req.params.id,
  });

  if (!vendor) {
    return next(new ErrorHandler("No vendor found!", 404));
  }

  res.status(200).json({ vendor: vendor });
});

exports.updateVendor = catchAsyncError(async (req, res, next) => {
  const { fullname, mobile_no, email } = req.body;

  const vendor = await venderModel.findByIdAndUpdate(
    req.params.id,
    { email, fullname, mobile_no },
    { new: true, runValidators: true }
  );

  res.status(200).json({ vendor: vendor });
});

exports.deleteVendor = catchAsyncError(async (req, res, next) => {
  const vendor = await venderModel.findById(req.params.id);

  if (!vendor) {
    return next(new ErrorHandler("Vendor does not exists!", 404));
  }

  await vendor.remove();

  res.status(200).json({ msg: "Vendor deleted!" });
});

exports.addSatisfiedCustomer = catchAsyncError(async (req, res, next) => {
  const { customerName, customerReview } = req.body;

  // console.log(req.body);

  const satisfiedCustomer = await staticModel.updateMany({
    $push: {
      customerReview: {
        _id: crypto.randomBytes(12).toString("hex"),
        customerName,
        customerReview,
      },
    },
  });

  res.status(200).json({ satisfiedCustomer: satisfiedCustomer });
});

exports.getSatisfiedCustomers = catchAsyncError(async (req, res, next) => {
  const satisfiedCustomers = await staticModel.findOne();

  // console.log(satisfiedCustomers);

  res.status(200).json({ satisfiedCustomers: satisfiedCustomers });
});

exports.getSatisfiedCustomer = catchAsyncError(async (req, res, next) => {
  const satisfiedCustomer = await staticModel.findOne();

  const satisfiedCustomerInfo = satisfiedCustomer.customerReview.filter(
    (customerReview) => customerReview._id === req.params.id
  );

  res.status(200).json({
    satisfiedCustomer: satisfiedCustomerInfo[0],
    createdAt: satisfiedCustomer.createdAt,
    updatedAt: satisfiedCustomer.updatedAt,
  });
});

exports.updateSatisfiedCustomer = catchAsyncError(async (req, res, next) => {
  const { customerName, customerReview } = req.body;

  const satisfiedCustomer = await staticModel.findOne();

  let index;
  index = satisfiedCustomer.customerReview.findIndex(
    (customerReview) => customerReview?._id === req.params.id
  );

  if (index >= 0) {
    console.log("index ", index);

    // console.log(satisfiedCustomer.customerReview[index]);

    satisfiedCustomer.customerReview[index] = {
      _id: req.params.id,
      customerName: customerName,
      customerReview: customerReview,
    };
  }
  await satisfiedCustomer.save();

  res.status(200).json({ satisfiedCustomer: satisfiedCustomer });
});

exports.deleteSatisfiedCustomer = catchAsyncError(async (req, res, next) => {
  const satisfiedCustomer = await staticModel.updateOne({
    $pull: { customerReview: { _id: req.params.id } },
  });

  res.status(200).json({ satisfiedCustomer: "deleted!" });
});

exports.addLatestNews = catchAsyncError(async (req, res, next) => {
  const { news } = req.body;

  const latestNews = await staticModel.updateMany({
    $push: {
      latestNews: {
        _id: crypto.randomBytes(12).toString("hex"),
        news,
      },
    },
  });

  res.status(200).json({ latestNews: latestNews });
});

exports.getLatestNewsDetails = catchAsyncError(async (req, res, next) => {
  const latestNewsDetails = await staticModel.findOne();

  // console.log(latestNewsDetails);

  res.status(200).json({ latestNewsDetails: latestNewsDetails });
});

exports.getLatestNews = catchAsyncError(async (req, res, next) => {
  const latestNews = await staticModel.findOne();

  const latestNewsInfo = latestNews.latestNews.filter(
    (latestNews) => latestNews._id === req.params.id
  );

  res.status(200).json({
    latestNews: latestNewsInfo[0],
    createdAt: latestNews.createdAt,
    updatedAt: latestNews.updatedAt,
  });
});

exports.updateLatestNews = catchAsyncError(async (req, res, next) => {
  const { news } = req.body;

  const latestNewsDoc = await staticModel.findOne();

  let index;
  index = await latestNewsDoc.latestNews.findIndex(
    (latestNews) => latestNews?._id === req.params.id
  );

  if (index >= 0) {
    console.log("index ", index);

    latestNewsDoc.latestNews[index] = { _id: req.params.id, news: news };
  }
  await latestNewsDoc.save();

  // console.log(" save ", latestNews);

  res.status(200).json({ latestNews: latestNewsDoc });
});

exports.deleteLatestNews = catchAsyncError(async (req, res, next) => {
  const latestNews = await staticModel.updateOne({
    $pull: { latestNews: { _id: req.params.id } },
  });

  res.status(200).json({ satisfiedCustomer: "deleted!" });
});
