const express = require('express');
const router = express.Router();
const { createStore, updateStore, deleteStore,getUserStores, getUserStoreById, getUserStoreBySlug} = require('../controllers/store');
const { checkAuth, authMiddleware } = require('../controllers/auth');

// Create store
router.post('/', authMiddleware, createStore);

// Update store
router.put('/:id', authMiddleware, updateStore);

// Delete store
router.delete('/:id', authMiddleware, deleteStore);

// Get User Store
router.get('/user/:userId', authMiddleware, getUserStores);

//Get User Store by ID
router.get('/id/:storeId', authMiddleware, getUserStoreById);

//Get Store by Slug
router.get('/:slug', getUserStoreBySlug);



module.exports = router;
