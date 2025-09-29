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
      banner,
      url,
      ownerId,
      categories,
      slug,
      mobileNumber,
      instaHandle,
      fbHandle,
      location,
    } = req.body;

    const slugExists = await prisma.store.findUnique({
      where: { slug: slug },
    });

    if (slugExists) {
      res.status(400).json({
        success: false,
        message: "Store with this slug already exists",
      });
      return;
    }

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
        mobileNumber,
        instaHandle,
        fbHandle,
        location,
      },
    });

    res.status(201).json(newStore);
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ error: "Failed to create store" });
  }
};

const getUserStores = async (req, res) => {
  try {
    const { userId } = req.params;
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

const createStoreFeedback = async (req, res) => {
  try {
    const { storeId, feedback } = req.body;
    const findStore = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!findStore) {
      return res
        .status(400)
        .json({ message: "Store Not Found", success: false });
    }

    await prisma.feedback.create({
      data: {
        ...feedback,
        storeId,
      },
    });

    return res
      .status(200)
      .json({ message: "Feedback added successfully", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

// backend
const getStoreFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { storeId: id },
      orderBy: {
        createdAt: "desc", // newest first
      },
    });

    return res.status(200).json(feedbacks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  createStore,
  updateStore,
  deleteStore,
  getUserStores,
  getUserStoreBySlug,
  getUserStoreById,
  createStoreFeedback,
  getStoreFeedback,
};
