const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const prisma = require("../utils/prisma-client"); // your Prisma client
const { PLANS } = require("../config/planConfig");

const Webhookverification = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const webhookBody = req.body; // raw buffer
  const webhookSignature = req.headers["x-razorpay-signature"];

  try {
    // verify webhook signature
    validateWebhookSignature(webhookBody, webhookSignature, webhookSecret);

    const event = JSON.parse(webhookBody.toString());

    const { payload } = event;
    const subscription = payload.subscription?.entity;
    const payment = payload.payment?.entity;

    // get userId from notes (passed in subscription/order creation)
    const userId = subscription?.notes?.userId || payment?.notes?.userId;
    const planName = subscription?.notes?.planName || payment?.notes?.planName;
    const plan = PLANS[planName];    

    if (!userId && !planName) {
      if(event.event !== "subscription.cancelled"){
         return res
        .status(400)
        .json({ success: false, message: "Invalid userId or plan Id" });
      }
    }

    // Handle subscription events
    if (subscription) {
      switch (event.event) {
        case "subscription.charged":
          await prisma.subscription.upsert({
            where: { razorpaySubscriptionId: subscription.id },
            update: {
              status: "ACTIVE",
              startedAt: new Date(subscription.current_start * 1000),
              expiresAt: new Date(subscription.current_end * 1000),
              plan: planName.toUpperCase(),
            },
            create: {
              razorpaySubscriptionId: subscription.id,
              status: "ACTIVE",
              startedAt: new Date(subscription.current_start * 1000),
              expiresAt: new Date(subscription.current_end * 1000),
              userId,
              plan: planName.toUpperCase(),
            },
          });

          // Example: refresh credits for subscription payment
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionCredits: plan?.credits ,
              plan: planName.toUpperCase(),
            },
          });
          break;

        case "subscription.cancelled":
          await prisma.subscription.updateMany({
            where: { razorpaySubscriptionId: subscription.id },
            data: { status: "CANCELLED" },
          });
          break;
      }
    }

    // Handle one-time payments
    if (payment && planName == 'AI_PACK' && event.event === "payment.captured") {
      await prisma.payment.create({
        data: {
          razorpayPaymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: "CAPTURED",
          userId,
        },
      });

      // optionally increment allowedGenerate or trigger other logic
      await prisma.user.update({
        where: { id: userId },
        data: { oneTimeCredits: { increment: 100 } },
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
};

module.exports = { Webhookverification };
