const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} = require("../controllers/orders");
const { checkAuth } = require("../controllers/auth");

const router = express.Router();

router.post("/", createOrder);
router.post("/get", checkAuth, getOrders);
router.get("/:id", checkAuth, getOrderById);
router.put("/:orderId/status",checkAuth, updateOrderStatus);
router.delete("/:id",checkAuth, deleteOrder);

module.exports = router;
