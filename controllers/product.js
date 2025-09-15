const prisma = require("../utils/prisma-client");

/**
 * Create a new product
 */
const createProduct = async (req, res) => {
  try {
    const user = req.user;
    const store = await prisma.store.findFirst({
      where: {
        ownerId: user.id,
      },
    });
    
    if (user.plan == null) {
      if (store?.products?.length == 10) {
        return res
          .status(400)
          .json({ message: "Cannot create more product. please subscribe" });
      }
    }

    const {
      name,
      price,
      inventory,
      category,
      description,
      image,
      storeId,
      discount,
    } = req.body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        inventory,
        category,
        description,
        image,
        storeId,
        discount,
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

/**
 * Update a product by ID
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, inventory, category, description, image, discount } =
      req.body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        inventory,
        category,
        description,
        image,
        discount,
        updatedAt: new Date(),
      },
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

/**
 * Get all products
 */
const getAllProducts = async (req, res) => {
  try {
    const { storeId } = req.body;
    const products = await prisma.product.findMany({
      where: { storeId: storeId }, // optional: include store details
    });
    res.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * Get single product by ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true }, // optional
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

/**
 * Delete a product by ID
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
};
