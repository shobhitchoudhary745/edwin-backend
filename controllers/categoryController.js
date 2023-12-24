const { categoryModel, productModel } = require("../models/productModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsyncError = require("../utils/catchAsyncError");

exports.createCategory = catchAsyncError(async (req, res, next) => {
  console.log("sdsd");
  const { name, description, category_image } = req.body;
  const category = await categoryModel.create({
    name,
    description,
    category_image,
  });
  res.status(200).json({ category });
});

exports.getAllCategories = catchAsyncError(async (req, res, next) => {
  const categoryCount = await categoryModel.countDocuments();
  console.log("categoryCount", categoryCount);
  const apiFeature = new APIFeatures(
    categoryModel.find().sort({ createdAt: -1 }),
    req.query
  ).search("name");

  let categories = await apiFeature.query;
  console.log("categories", categories);
  let filteredCategoryCount = categories.length;
  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    console.log("filteredCategoryCount", filteredCategoryCount);
    categories = await apiFeature.query.clone();
    console.log("categories1", categories);
  }
  res.status(200).json({ categories, categoryCount, filteredCategoryCount });
});

exports.getCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findById(id);
  res.status(200).json({ category });
});

exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const products = await productModel
    .find({ category: id })
    .populate("category");

  res.status(200).json({ products });
});

// exports.getAllSubCategory = catchAsyncError(async (req, res, next) => {
//   const categories = await subCategoryModel.aggregate([
//     {
//       $lookup: {
//         from: "categories",
//         localField: "category",
//         foreignField: "_id",
//         as: "category",
//       },
//     },
//     { $unwind: { path: "$category" } },
//     {
//       $group: {
//         _id: { name: "$category.name", cat_id: "$category._id" },
//         subCategories: { $push: "$$ROOT" },
//       },
//     },
//     {
//       $project: {
//         "subCategories.name": 1,
//         "subCategories._id": 1,
//       },
//     },
//   ]);
//   console.log(categories);
//   res.status(200).json({ categories });
// });

exports.updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({ category });
});

exports.deleteCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let category = await categoryModel.findById(id);

  if (!category) {
    return res.status(404).json({ message: "Category Not Found" });
  }

  await category.remove();

  res.status(200).json({
    success: true,
    message: "Category Deleted successfully.",
  });
});
