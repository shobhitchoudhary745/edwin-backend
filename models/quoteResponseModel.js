const mongoose = require("mongoose");

const quoteResponseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "quotes",
      required: true,
    },
    // response: [
    //   {
    //     from: {
    //       type: String,
    //       required: true,
    //     },
    //     responses: {
    //       type: Array,
    //     },
    //   },
    // ],
    response: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

const quoteResponseModel = mongoose.model(
  "quotesResponse",
  quoteResponseSchema
);

module.exports = quoteResponseModel;
