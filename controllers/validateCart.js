const prisma = require("../utils/prisma-client");

const validateCart = async (req, res) => {
  try {
    const { items } = req.body;
    const updatedCart = [];
    
    for (let item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, inventory: true, price: true, name: true },
      });

      if (!product || product.inventory <= 0) {
        continue; // remove from cart
      }

      const validQuantity = Math.min(item.quantity, product.inventory);

      updatedCart.push({
        ...item,
        quantity: validQuantity,
        price: product.price, // refresh price
      });
    }

    if (updatedCart.length !== items.length) {
      return res.json({
        success: false,
        message: "Some items were removed or updated due to stock changes.",
        updatedCart,
      });
    }

    res.json({ success: true, updatedCart });
  } catch (error) {
     return res.status(400).json({
        success: false,
        message: "Server error while validating the cart.",
      });
  }
};
module.exports = { validateCart };
