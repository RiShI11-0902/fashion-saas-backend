const prisma = require("../utils/prisma-client");

/**
 * Create a new store
 */
const createStore = async (req, res) => {
  try {
    const {
      name,
      description,
      logo,
      imageUrl,
      url,
      ownerId,
      categories,
      slug,
      mobileNumber
    } = req.body;
    const banner = imageUrl;

    const newStore = await prisma.store.create({
      data: {
        name,
        description,
        logo,
        banner,
        url,
        ownerId,
        categories,
        slug,
        mobileNumber
      },
    });

    res.status(201).json(newStore);
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ error: "Failed to create store" });
  }
};

const getUserStores = async (req, res) => {
  console.log("hi");

  try {
    const { userId } = req.params;
    console.log(userId);
    const stores = await prisma.store.findMany({
      where: { ownerId: userId },
    });
    res.json({ stores });
  } catch (error) {
    res.status(500).json({ error: "Failed to get store" });
  }
};

const getUserStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;
    const stores = await prisma.store.findMany({
      where: { id: storeId },
    });
    res.json({ stores });
  } catch (error) {
    res.status(500).json({ error: "Failed to get store" });
  }
};

const getUserStoreBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const store = await prisma.store.findUnique({
      where: { slug: slug },
    });


    res.json({ store });
  } catch (error) {
    res.status(500).json({ error: "Failed to get store" });
  }
};

/**
 * Update a store by ID
 */
const updateStore = async (req, res) => {
  try {
    const { id } = req.params; // store id from URL
    const { updates } = req.body;
    const updatedStore = await prisma.store.update({
      where: { id },
      data: updates,
    });

    res.json(updatedStore);
  } catch (error) {
    console.error("Error updating store:", error);
    res.status(500).json({ error: "Failed to update store" });
  }
};

/**
 * Delete a store by ID
 */
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.store.delete({
      where: { id },
    });

    res.json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("Error deleting store:", error);
    res.status(500).json({ error: "Failed to delete store" });
  }
};

module.exports = {
  createStore,
  updateStore,
  deleteStore,
  getUserStores,
  getUserStoreBySlug,
  getUserStoreById,
};
