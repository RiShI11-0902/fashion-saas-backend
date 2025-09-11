const multer =  require("multer");

// Store files in memory (not on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = {upload};
