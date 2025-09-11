const express = require("express");
const { generateImage } = require("../controllers/generate-ai-model");
const { upload } = require("../utils/multer-middleware");

const router = express.Router();

router.post("/", upload.single("image"), generateImage);

module.exports = router;
