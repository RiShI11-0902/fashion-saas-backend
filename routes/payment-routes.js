const express = require('express')
const { checkAuth, authMiddleware } = require('../controllers/auth')
const { create_Subscription, payment_verification, getKey, cancel_subscription,getUserSubscriptions , buyImages} = require('../controllers/payment-controller')

const router = express.Router()

router.post("/buy-subscription", create_Subscription )

router.get('/buy-images', buyImages )

router.post("/verification", payment_verification )

router.get("/get-key", getKey)

router.delete("/subscription-cancel", cancel_subscription )

router.get("/user-subcription", getUserSubscriptions)




module.exports = router