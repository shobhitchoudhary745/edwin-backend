const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error");
const dotenv = require("dotenv");
const app = express();

dotenv.config({ path: "./config/config.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    credentials: true,
  })
);

app.get("/", (req, res, next) => res.json({ anc: "abc" }));

const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const adminRoute = require("./routes/adminRoute");
const intermediaryRoute = require("./routes/intermediaryRoute");
const promotionRoute = require("./routes/promotionRoute");
const reviewRoute = require("./routes/reviewRoute");
const staticRoute = require("./routes/staticRoute");
const quoteRoute = require("./routes/quoteRoute");
const installerRoute = require("./routes/installerRoute");
const contactusRoute = require("./routes/contactusRoute");

app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/admin", adminRoute);
app.use("/api/intermediary", intermediaryRoute);
app.use("/api/promotion", promotionRoute);
app.use("/api/review", reviewRoute);
app.use("/api/static", staticRoute);
app.use("/api/quote", quoteRoute);
app.use("/api/installers", installerRoute);
app.use("/api/contactus", contactusRoute);

app.all("*", async (req, res) => {
  res.status(404).json({
    error: {
      message: "Not Found. Kindly Check the API path as well as request type",
    },
  });
});

app.use(errorMiddleware);

module.exports = app;
