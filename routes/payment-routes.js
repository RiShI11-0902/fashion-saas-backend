const express = require('express')
const { checkAuth } = require('../controllers/auth')
const { create_Subscription, payment_verification, getKey, cancel_subscription,getUserSubscriptions , buyImages} = require('../controllers/payment-controller')

const router = express.Router()

router.get("/buy-subscription", checkAuth, create_Subscription )

router.get('/buy-images', checkAuth, buyImages )

router.post("/verification", checkAuth, payment_verification )

router.get("/get-key", getKey)

router.delete("/subscription-cancel", checkAuth, cancel_subscription )

router.get("/user-subcription", checkAuth, getUserSubscriptions)




module.exports = router