const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: {
          type: Object,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        installDate: {
          type: Date,
          default: null,
        },
        assignedInstallationDate: {
          type: Date,
          default: null,
        },
        installer: {
          type: Schema.Types.ObjectId,
          ref: "installers",
        },
      },
    ],
    amount: {
      type: Number,
      required: true,
    },
    address: {
      country: {
        type: String,
        required: true,
      },
      town: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      post_code: {
        type: String,
        required: true,
      },
      mobile_no: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "delivered", "canceled", "failed", "expired"],
    },
    orderId: {
      type: String,
      required: true,
    },
    mollieOrderId: {
      type: String,
      required: true,
    },
    installer:{
      type:Schema.Types.ObjectId,
      ref:"installers"
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
