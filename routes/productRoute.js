const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getRecentProducts,
  getProductInfo,
} = require("../controllers/productController");
const { auth } = require("../middlewares/auth");
const router = express.Router();

router.post("/create", createProduct);
router.get("/all", getAllProducts);
router.get("/all-info/:id", auth, getProductInfo);
router.route("/:id").delete(deleteProduct).put(updateProduct).get(getProduct);
router.get("/:id/get-recent", getRecentProducts);

module.exports = router;
