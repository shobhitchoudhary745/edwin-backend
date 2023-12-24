const mongoose = require("mongoose");

const intermediaryClientSchema = new mongoose.Schema({
  intermediary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const intermediaryClientModel = mongoose.model(
  "intermediaryClient",
  intermediaryClientSchema
);

module.exports = intermediaryClientModel;
