const catchAsyncError = require("../utils/catchAsyncError");
const notificationModel = require("../models/notificationModel");
const mongoose = require("mongoose");
const ErrorHandler = require("../utils/errorHandler");

exports.getNotification = catchAsyncError(async (req, res, next) => {
  console.log("get notification called");
  const userId = req.userId;

  try {
    const notifications = await notificationModel.find({ user: userId });
    console.log(notifications);
    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
  }
});

exports.markReadNotification = catchAsyncError(async (req, res, next) => {
  const notificationId = req.params.id;
  console.log(notificationId);
  // const notifications = await notificationModel.find({ user: '64884b1c73631ed1e98f5cba' });
  // if (!notifications) {
  //   return res.status(404).json({ message: 'Notification not found' });
  // }

  notificationModel.updateOne(
    { "notification._id": notificationId },
    {
      $set: {
        "notification.$.isRead": true,
      },
    },
    (error, result) => {
      if (error) {
        console.error("Error updating notification:", error);
        return next(ErrorHandler("Error updating notification", 409));
      } else {
        console.log("Notification updated:", result);
        return res.status(200).json({ message: "updated successfully" });
      }
    }
  );
});
