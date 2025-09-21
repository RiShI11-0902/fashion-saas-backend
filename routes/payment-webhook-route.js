const express = require("express");
const { checkAuth } = require("../controllers/auth");
const { Webhookverification } = require("../controllers/webhook-verification");

const router = express.Router();

router.post("/", Webhookverification);

module.exports = router;
