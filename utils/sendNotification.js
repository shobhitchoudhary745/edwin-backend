const notificationModel = require("../models/notificationModel");

const sendNotification = async (userId) => {
  console.log("send notification", userId);

  const alreadyExists = await notificationModel.findOne({ user: userId });
  if (alreadyExists) {
    await notificationModel.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          notification: {
            message:
              "You have received a new mail regarding your recent quote request from the admin.",
            isRead: false,
          },
        },
      },
      { new: true }
    );
  } else {
    const notification = [
      {
        message:
          "You have received a new mail regarding your recent quote request from the admin.",
      },
    ];

    const newNotification = await notificationModel.create({
      user: userId,
      notification: notification,
    });

    await newNotification.save();
  }

  //   const updatedNotification = await notificationModel.findOneAndUpdate(
  //     { user: userId },
  //     {
  //       $push: {
  //         notification: {
  //           message:
  //             "You have received a new mail regarding your recent quote request from the admin.",
  //           isRead: false,
  //         },
  //       },
  //     },
  //     { new: true }
  //   );
};

module.exports = sendNotification;
