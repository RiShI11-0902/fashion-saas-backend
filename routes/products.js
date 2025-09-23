const express = require("express");
const router = express.Router();
const {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
} = require("../controllers/product");
const { authMiddleware } = require("../controllers/auth");

// Create
router.post("/", authMiddleware, createProduct);

// Update
router.put("/:id", authMiddleware, updateProduct);
// Get all
router.post("/store", getAllProducts);

// Get one
router.get("/:id", getProductById);

// Delete
router.delete("/delete/:id", authMiddleware, deleteProduct);

module.exports = router;
