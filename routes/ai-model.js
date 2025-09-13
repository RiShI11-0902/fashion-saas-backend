const express = require("express");
const { generateImage } = require("../controllers/generate-ai-model");
const { upload } = require("../utils/multer-middleware");
const { checkAuth } = require("../controllers/auth");

const router = express.Router();

router.post("/", checkAuth, upload.single("image"), generateImage);

module.exports = router;
