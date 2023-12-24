const Order = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const { v4: uuid } = require("uuid");
const catchAsyncError = require("../utils/catchAsyncError");
const APIFeatures = require("../utils/apiFeatures");
const dotenv = require("dotenv");
const ErrorHandler = require("../utils/errorHandler");
const couponModel = require("../models/couponModel");

const { createMollieClient } = require("@mollie/api-client");

dotenv.config();

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_CLIENT });

exports.createOrder = async (req, res, next) => {
  const userId = req.userId;

  const cart = await cartModel
    .findOne({ user: userId })
    .populate("items.product");

  if (cart.length <= 0)
    return next(
      new ErrorHandler("Order can't placed. Add product to cart.", 401)
    );

  const products = cart?.items?.map((i) => {
    return {
      quantity: i?.quantity,
      product: { ...i?.product?._doc },
      installDate: i?.installationDate,
    };
  });

  var total = 0;
  if (cart?.items.length > 0) {
    cart?.items.forEach(({ product, quantity }) => {
      total += product?.amount * quantity;
    });
  }
  console.log(products)
  const { country, post_code, town, street, mobile_no, coupon_code } = req.body;

  const unique_id = uuid();
  const orderId = unique_id.slice(0, 6);

  console.log("orderId ", orderId);
  console.log("order create", req.body);

  if (coupon_code) {
    const coupon = await couponModel.findOne({
      user: userId,
      _id: coupon_code,
    });
    console.log("coupon", coupon);
    console.log({
      now: Date.now(),
      createdAt: coupon.createdAt,
      diff: Date.now() - coupon.createdAt,
    });

    if (Date.now() - coupon.createdAt <= 30 * 60 * 60 * 1000) {
      total -= coupon.amount;
      await coupon.remove();
    } else return next(new ErrorHandler("Coupon is expired.", 401));
  }

  const user = await userModel.findOne({ _id: userId });

  const lines = products.map((product) => {
    return {
      name: product.product.name,
      quantity: product.quantity,
      unitPrice: {
        currency: "EUR",
        value: parseFloat(product.product.amount).toFixed(2),
      },

      totalAmount: {
        currency: "EUR",
        value: parseFloat((product.quantity * product.product.amount)).toFixed(2),
      },
      vatRate: "0.00",
      vatAmount: {
        currency: "EUR",
        value: "0.00",
      },
    };
  });

  try {
    const order = await mollieClient.orders.create({
      amount: {
        currency: "EUR",
        value: total.toFixed(2),
        // value: "2000.00",
      },
      orderNumber: "#" + orderId,
      locale: "en_US",
      // method: "ideal",
      method: ["ideal", "banktransfer", "creditcard"],
      lines: lines,
      billingAddress: {
        givenName: user.firstname,
        // givenName: "shreyas",
        familyName: user.lastname,
        // familyName: "test",
        email: user.email,
        // email: "workshreyas007@gmail.com",
        streetAndNumber: street,
        // streetAndNumber: "stree",
        postalCode: post_code,
        // postalCode: "90001",
        country: "US",
        city: town,
        // city: "Los angeles",
      },
      redirectUrl: process.env.MOLLIE_REDIRECT_URL,
      cancelUrl: process.env.MOLLIE_CANCEL_URL,
      // redirectUrl: `http://localhost:3000/home/order`,
      // cancelUrl: "http://localhost:3000/home/cart",
      // webhookUrl:
      //   "https://dd33-2405-201-2001-d05a-c198-e068-969f-b7f8.ngrok-free.app/api/order/webhook",
      webhookUrl: process.env.MOLLIE_WEBHOOK_URL,
      payment: {
        // webhookUrl:
        //   "https://dd33-2405-201-2001-d05a-c198-e068-969f-b7f8.ngrok-free.app/api/order/webhook",
        webhookUrl: process.env.MOLLIE_WEBHOOK_URL,
      },
      // expiresAt: "2023-06-14",
    });

    const newOrder = new Order({
      userId: userId,
      products: products,
      amount: total,
      address: {
        country,
        post_code,
        street,
        town,
        mobile_no,
      },
      orderId: "#" + orderId,
      mollieOrderId: "orderid",
    });

    const savedOrder = await newOrder.save();

    await cartModel.updateOne({ user: req.userId }, { $set: { items: [] } });

    res.status(200).json({ message: "Order created!", savedOrder });
    // res.redirect(order._links.checkout.href);
  } catch (err) {
    console.log(err);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

exports.verifyOrderStatus = async (req, res, next) => {
  console.log("webhook!!! ", req.body.id);

  try {
    const orderDetails = await mollieClient.orders.get(req.body.id);
    // console.log(orderDetails);

    const order = await Order.findOne({ mollieOrderId: req.body.id });

    if (orderDetails.status === "paid") {
      console.log("paid");

      order.status = "paid";
      await order.save();

      return res.status(200).json({ status: "ok" });
    }
  } catch (error) {
    const paymentDetails = await mollieClient.payments.get(req.body.id);
    console.log("pay details!! ", paymentDetails);

    const order = await Order.findOne({
      mollieOrderId: paymentDetails.orderId,
    });

    console.log("other status", paymentDetails.status);

    order.status = paymentDetails.status;
    await order.save();

    return res.status(200).json({ status: "ok" });
  }

  return res.status(200).json({ status: "ok" });
  // // if (orderDetails.status === "canceled") {
  // console.log("other! ", orderDetails.status);

  // return res.status(200).json({ status: "ok" });
};

exports.refundOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id });

    const refund = await mollieClient.orderRefunds.create({
      orderId: order.mollieOrderId,
      lines: [],
      description: `Refund your order number #${order.orderId}`,
    });

    res.status(200).json({ refund, msg: "Refund initiated!" });
  } catch (error) {
    console.log("refund order err", error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

exports.getOrder = async (req, res, next) => {
  
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ _id: -1 })
      .limit(1);
      // console.log("myorders:" ,orders)
      // res.status(200).json({ message: "Order found!", orders });
    
    if (orders[0].status !== "paid") {
      // await orders.remove();
      console.log("delete id ", orders[0]._id);
      await Order.findByIdAndDelete(orders[0]._id);
      return res.status(200).json({ message: "Please complete your payment!" });
    } else {
      console.log("paid get order ", orders[0]._id);
      await cartModel.updateOne({ user: req.userId }, { $set: { items: [] } });

      return res.status(200).json({ message: "Order found!", orders });
    }
  } catch (err) {
    return next(ErrorHandler("Internal server error", 500));
  }
};

exports.getRecent = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ _id: -1 })
      .limit(4);

    res.status(200).json({ message: "Order found!", orders });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    let query = { userId: req.userId };
    if (req.query.status !== "all") query.status = req.query.status;

    const apiFeature = new APIFeatures(
      Order.find(query).sort({ createdAt: -1 }).populate("products.installer"),
      req.query
    );

    const orders = await apiFeature.query;
    // const orders = await Order.find({ userId: req.userId });

    res.status(200).json({ orders });
  } catch (err) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};

// admin control
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let order = await Order.findById(id);
  console.log("delete order", order);
  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }

  await order.remove();

  res.status(200).json({
    success: true,
    message: "Order Deleted successfully.",
  });
});

exports.getOrderById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  console.log("get order", id);
  const order = await Order.findById(id)
    .sort({ createdAt: -1 })
    .populate("userId");

  if (!order) return next(new ErrorHandler("Order not found.", 404));

  res.status(200).json({ order });
});

exports.updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = await Order.findById(id);

  if (!order) return next(new ErrorHandler("Order not found.", 404));

  order.status = status;
  await order.save();
  res.status(200).json({ order });
});

exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  console.log("req.query", req.query);
  let query = {};
  if (req.query.orderId) {
    query = {
      orderId: {
        $regex: req.query.orderId,
        $options: "i",
      },
    };
  }

  if (req.query.status !== "all") query.status = req.query.status;

  console.log("query", query);
  const apiFeature = new APIFeatures(
    Order.find(query).sort({ createdAt: -1 }).populate("userId").populate("installer"),
    req.query
  );

  let orders = await apiFeature.query;
  // console.log("orders", orders);
  let filteredOrderCount = orders.length;

  apiFeature.pagination();
  orders = await apiFeature.query.clone();

  res.status(200).json({ orders, filteredOrderCount });
});
