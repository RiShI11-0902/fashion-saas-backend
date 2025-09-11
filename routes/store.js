const express = require('express');
const router = express.Router();
const { createStore, updateStore, deleteStore,getUserStores, getUserStoreById, getUserStoreBySlug} = require('../controllers/store');

// Create store
router.post('/', createStore);

// Update store
router.put('/:id', updateStore);

// Delete store
router.delete('/:id', deleteStore);

// Get User Store
router.get('/user/:userId', getUserStores);

//Get User Store by ID
router.get('/id/:storeId', getUserStoreById);

//Get Store by Slug
router.get('/:slug', getUserStoreBySlug);



module.exports = router;
