const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Please provide the category's name."],
    },
    description: {
      type: String,
      required: [true, "Please describe the category."],
    },
    category_image: {
      type: String,
    },
  },
  { timestamps: true }
);
const categoryModel = mongoose.model("Category", categorySchema);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide the product's name."],
    },
    description: [{
      type: String,
      required: [true, "Please describe the product."],
    }],
    amount: {
      type: Number,
      required: [true, "Please enter the amount of product."],
    },
    product_images: [{ type: String }],
    stock: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    warranty: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide belonging category."],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vender",
      required: [true, "Please provide belonging vendor."],
    },
    productDescriptionUrl: {
      type:String
    }
  },
  { timestamps: true }
);
const productModel = mongoose.model("Product", productSchema);

module.exports = { categoryModel, productModel };
