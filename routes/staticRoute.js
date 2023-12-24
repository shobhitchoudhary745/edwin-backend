const express = require("express");
const { getStatic } = require("../controllers/staticController");
const router = express.Router();

router.get("/get-static", getStatic);

module.exports = router;
