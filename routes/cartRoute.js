const express = require("express");
const { validateCart } = require("../controllers/validateCart");
const router = express.Router();

router.post("/validate", validateCart );

module.exports = router;
