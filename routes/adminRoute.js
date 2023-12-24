const express = require("express");
const {
  getStatistics,
  getAll,
  postSingleImage,
  postMultipleImages,
  addStaticContent,
  getStaticContent,
  updateStaticContent,
  viewStaticContent,
  addInstallers,
  getInstallers,
  getInstaller,
  updateInstaller,
  deleteInstaller,
  addIntermediary,
  getAllIntermediaries,
  getIntermediary,
  updateIntermediary,
  deleteIntermediary,
  addVendor,
  getAllVendors,
  getVendor,
  updateVendor,
  deleteVendor,
  getInterPerClientInfo,
  addSatisfiedCustomer,
  getSatisfiedCustomers,
  getSatisfiedCustomer,
  updateSatisfiedCustomer,
  deleteSatisfiedCustomer,
  addLatestNews,
  getLatestNewsDetails,
  getLatestNews,
  updateLatestNews,
  deleteLatestNews,
} = require("../controllers/adminController");
const {
  createCategory,
  deleteCategory,
  updateCategory,
} = require("../controllers/categoryController");
const {
  getAllOrders,
  deleteOrder,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductInstallDate,
  addProductInstaller,
} = require("../controllers/productController");
const {
  createPromotion,
  updatePromotion,
  deletePromotion,
} = require("../controllers/promotionController");
const { allReviews, deleteReview } = require("../controllers/reviewController");
const {
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/subCategoryController");
const {
  adminLogin,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { auth, isAdmin } = require("../middlewares/auth");
const { s3Uploadv2, upload, s3UploadMulti } = require("../utils/s3");
const {
  getQuotes,
  getQuote,
  deleteQuote,
  quoteResp,
  updateQuoteStatus,
  getClientQuotesInfo,
  quoteResponses,
} = require("../controllers/quoteController");
const { getSearchedInstallers } = require("../controllers/installerController");
const {
  getAllContactus,
  getContactus,
  deleteContactus,
} = require("../controllers/contactusController");
const router = express.Router();

router.get("/all", getAll);
router.get("/statistics/:time", auth, isAdmin, getStatistics);
router.get("/intermediariesInfo", auth, isAdmin, getInterPerClientInfo);
router.post("/login", adminLogin);
router.get("/user/all", auth, isAdmin, getAllUsers);
router
  .route("/user/:id")
  .put(auth, isAdmin, updateUser)
  .get(auth, isAdmin, getUser)
  .delete(auth, isAdmin, deleteUser);

router.get("/orders/all", auth, isAdmin, getAllOrders);
router.put("/order/:id/update/status", auth, isAdmin, updateOrderStatus);
router
  .route("/order/:id")
  .get(auth, isAdmin, getOrderById)
  .delete(auth, isAdmin, deleteOrder);

router.post("/category/create", auth, isAdmin, createCategory);
router
  .route("/category/:id")
  .put(auth, isAdmin, updateCategory)
  .delete(auth, isAdmin, deleteCategory);

router.post("/product/create", auth, isAdmin, createProduct);
router.put("/update-productDate/:id", auth, isAdmin, updateProductInstallDate);
router.put("/update-productInstaller/:id", auth, isAdmin, addProductInstaller);
router
  .route("/product/:id")
  .put(auth, isAdmin, updateProduct)
  .delete(auth, isAdmin, deleteProduct);

router.get("/review/all", auth, isAdmin, allReviews);
router.delete("/review/:id", auth, isAdmin, deleteReview);

router.post("/promotion/create", auth, isAdmin, createPromotion);
router
  .route("/promotion/:id")
  .put(auth, isAdmin, updatePromotion)
  .delete(auth, isAdmin, deletePromotion);

router.post("/image", upload.single("image"), postSingleImage);
router.post("/multi-image", upload.array("image"), postMultipleImages);

router.post("/add/static", auth, isAdmin, addStaticContent);
router.get("/get/staticCont", auth, isAdmin, getStaticContent);
router.get("/get/static/:id", auth, isAdmin, viewStaticContent);
router.put("/update/static/:id", auth, isAdmin, updateStaticContent);

router.get("/getAll-quotes", auth, isAdmin, getQuotes);
router.get("/get-quote/:id", auth, isAdmin, getQuote);
router.get("/get-clientQuotes/:id", auth, isAdmin, getClientQuotesInfo);
router.put("/update-quote-status/:id", auth, isAdmin, updateQuoteStatus);
router.delete("/delete-quote/:id", auth, isAdmin, deleteQuote);
router.post("/quote-resp/:id", auth, isAdmin, quoteResp);
router.get("/previous-quote-resp/:id", auth, isAdmin, quoteResponses);

router.post("/add-installer", auth, isAdmin, addInstallers);
router.get("/get-installers", auth, isAdmin, getInstallers);
router.get("/get-installer/:id", auth, isAdmin, getInstaller);
router.get("/get-search-installer", auth, isAdmin, getSearchedInstallers);
router.put("/update-installer/:id", auth, isAdmin, updateInstaller);
router.delete("/delete-installer/:id", auth, isAdmin, deleteInstaller);

router.post("/add-intermediary", auth, isAdmin, addIntermediary);
router.get("/get-intermediaries", auth, isAdmin, getAllIntermediaries);
router.get("/get-intermediary/:id", auth, isAdmin, getIntermediary);
router.put("/update-intermediary/:id", auth, isAdmin, updateIntermediary);
router.delete("/delete-intermediary/:id", auth, isAdmin, deleteIntermediary);

router.get("/all-contactus", auth, isAdmin, getAllContactus);
router.get("/view-contactus/:id", auth, isAdmin, getContactus);
router.delete("/delete-contactus/:id", auth, isAdmin, deleteContactus);

router.post("/add-vendor", auth, isAdmin, addVendor);
router.get("/get-vendors", auth, isAdmin, getAllVendors);
router.get("/get-vendor/:id", auth, isAdmin, getVendor);
router.put("/update-vendor/:id", auth, isAdmin, updateVendor);
router.delete("/delete-vendor/:id", auth, isAdmin, deleteVendor);

router.post("/add-satisfiedCustomer", auth, isAdmin, addSatisfiedCustomer);
router.get("/get-satisfiedCustomers", auth, isAdmin, getSatisfiedCustomers);
router.get("/get-satisfiedCustomer/:id", auth, isAdmin, getSatisfiedCustomer);
router.put(
  "/update-satisfiedCustomer/:id",
  auth,
  isAdmin,
  updateSatisfiedCustomer
);
router.delete(
  "/delete-satisfiedCustomer/:id",
  auth,
  isAdmin,
  deleteSatisfiedCustomer
);

router.post("/add-latestNews", auth, isAdmin, addLatestNews);
router.get("/get-latestNews", auth, isAdmin, getLatestNewsDetails);
router.get("/get-latestNews/:id", auth, isAdmin, getLatestNews);
router.put("/update-latestNews/:id", auth, isAdmin, updateLatestNews);
router.delete("/delete-latestNews/:id", auth, isAdmin, deleteLatestNews);

module.exports = router;
