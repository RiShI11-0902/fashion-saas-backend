const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create new order
const createOrder = async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerMobileNumber,
    alternateMobileNumber,
    customerAddress,
    items,
    totalAmount,
    storeId,
  } = req.body;

   const lastOrder = await prisma.order.findFirst({
      where: { storeId: storeId },
      orderBy: { orderNumber: "desc" },
    });

    const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

  try {
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerMobileNumber,
        alternateMobileNumber,
        customerAddress,
        totalAmount,
        storeId,
        items: {
          create: items?.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            storeId: item.storeId,
            storeName: item.storeName,
            size: item.size
          })),
        },
        orderNumber
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// Get all orders
const getOrders = async (req, res) => {
  try {
    const { storeId } = req.body;    

    if (!storeId) {
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
    const orders = await prisma.order.findMany({
      where: { storeId: storeId },
      include: { items: true },
      orderBy:{ createdAt: 'desc'}
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  console.log(orderId, status);

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.order.delete({ where: { id } });
    res.json({ message: "Order deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete order" });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
