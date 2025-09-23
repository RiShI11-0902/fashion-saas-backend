const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} = require("../controllers/orders");
const { checkAuth, authMiddleware } = require("../controllers/auth");

const router = express.Router();

router.post("/", createOrder);
router.post("/get", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:orderId/status",authMiddleware, updateOrderStatus);
router.delete("/:id",authMiddleware, deleteOrder);

module.exports = router;
