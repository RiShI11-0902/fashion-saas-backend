const express = require("express");
const router = express.Router();
const {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
} = require("../controllers/product");

// Create
router.post("/", createProduct);

// Update
router.put("/:id", updateProduct);

// Get all
router.post("/store", getAllProducts);

// Get one
router.get("/:id", getProductById);

// Delete
router.delete("/delete/:id", deleteProduct);

module.exports = router;
