const express = require('express');
const router = express.Router();
const { createStore, updateStore, deleteStore,getUserStores, getUserStoreById, getUserStoreBySlug} = require('../controllers/store');
const { checkAuth } = require('../controllers/auth');

// Create store
router.post('/', checkAuth, createStore);

// Update store
router.put('/:id', checkAuth, updateStore);

// Delete store
router.delete('/:id', checkAuth, deleteStore);

// Get User Store
router.get('/user/:userId', checkAuth, getUserStores);

//Get User Store by ID
router.get('/id/:storeId', checkAuth, getUserStoreById);

//Get Store by Slug
router.get('/:slug', getUserStoreBySlug);



module.exports = router;
