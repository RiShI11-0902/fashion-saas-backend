const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} = require("../controllers/orders");

const router = express.Router();

router.post("/", createOrder);
router.post("/get", getOrders);
router.get("/:id", getOrderById);
router.put("/:orderId/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;
