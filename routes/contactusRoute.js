const express = require("express");

const { auth } = require("../middlewares/auth");
const { addContactus } = require("../controllers/contactusController");
const router = express.Router();

router.post("/add-contactus", addContactus);

module.exports = router;
