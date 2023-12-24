const express = require("express");
const { addQuote } = require("../controllers/quoteController");
const { auth } = require("../middlewares/auth");
const router = express.Router();

router.post("/add", auth, addQuote);

module.exports = router;
