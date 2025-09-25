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
            size: item.size,
          })),
        },
        orderNumber,
      },
      include: { items: true },
    });

    if (order) {
      for (let item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, inventory: true, name: true },
        });

        if (product.inventory > 0) product.inventory--;
      }
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// Get all orders
const getOrders = async (req, res) => {
  try {
    const { storeId, status, orderNumber, page = 1, limit = 10 } = req.body;
    const skip = (page - 1) * limit;

    const filter = { storeId };
    if (orderNumber) {
      filter.orderNumber = Number(orderNumber);
    }
    if (status != "all") {
      filter.status = status;
    }

    if (!storeId) {
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
    const orders = await prisma.order.findMany({
      where: filter,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.order.count({
      where: filter,
    });

    res.json({ orders, total });
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
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const findOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (status == "CANCELLED") {
      for(let item of findOrder.items){
        await prisma.product.update({
          where: {id: item.productId},
          data:{inventory: {increment: item.quantity} }
        })
      }
    }
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include:{items: true}
    });
    res.json(updatedOrder);
  } catch (error) {
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
