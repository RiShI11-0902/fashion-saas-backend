const express = require("express");
const router = express.Router();
const {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
} = require("../controllers/product");
const { checkAuth } = require("../controllers/auth");

// Create
router.post("/", checkAuth, createProduct);

// Update
router.put("/:id", checkAuth, updateProduct);
// Get all
router.post("/store", getAllProducts);

// Get one
router.get("/:id", getProductById);

// Delete
router.delete("/delete/:id", checkAuth, deleteProduct);

module.exports = router;
