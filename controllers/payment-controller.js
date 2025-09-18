const { instance } = require("../config/paymentConfig");
const prisma = require("../utils/prisma-client");
const crypto = require("node:crypto");

const getUserSubscriptions = async (req, res) => {
  try {
    // req.user should come from JWT middleware (decoded token)
    const userId = req.user.id;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: {
        id: true,
        plan: true,
        status: true,
        startedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
    });
  }
};

const getKey = (async = (req, res) => {
  try {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(400).json({ error: "Internal Server Error" });
    res.status(400).json({ error: "Internal Server Error" });
  }
});

const create_Subscription = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user)
      return res
        .status(401)
        .json({ sucess: false, message: "Not Authenticated" });

    console.log(user);

    const subscriptionResponse = await instance.subscriptions.create({
      plan_id: process.env.PLAN_ID,
      total_count: 12,
      customer_notify: 1,
    });

    const existingSub = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (existingSub) {
      // update existing subscription
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          razorpaySubscriptionId: subscriptionResponse.id,
          status: subscriptionResponse.status, // usually "created"
        },
      });
    } else {
      // create new subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          razorpaySubscriptionId: subscriptionResponse.id,
          status: subscriptionResponse.status,
        },
      });
    }

    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     subscription: {
    //       create: {
    //         razorpaySubscriptionId: subscription.id, // from Razorpay response
    //         status: subscription.status, // e.g. "created"
    //       },
    //     },
    //   },
    // });

    res
      .status(201)
      .json({ sucess: true, subscription: subscriptionResponse.id });
  } catch (error) {
    console.log(error);

    return res.status(400).json({ sucess: false, message: "Error Occurred" });
  }
};

const payment_verification = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    const user = req.user; // coming from auth middleware
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authenticated" });
    }

    // 1️⃣ Get subscription from your DB
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    const isAuthentic = generated_signature === razorpay_signature;

    if (!isAuthentic) {
      return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
    }

    // 3️⃣ Update subscription status → ACTIVE
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { 
        status: "ACTIVE",
        plan:'PREMIUM'
      },
    });

    /// update User
    await prisma.user.update({
      where:{ id: user.id},
      data:{ 
        allowedGenerate: 200,
        plan:'PREMIUM'
       }
    })

    // 4️⃣ Store payment record
    await prisma.payment.create({
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySubscriptionId: razorpay_subscription_id,
        razorpaySignature: razorpay_signature,
        amount: 300000, // ⚠️ Replace with real amount from webhook/plan
        currency: "INR",
        status: "captured",
        subscription: {
          connect: { id: subscription.id }, // ✅ links to Subscription
        },
        user: {
          connect: { id: user.id }, // ✅ links to User
        },
      },
    });

    // 5️⃣ Redirect success
    res.redirect(`${process.env.CLIENT_URL}/payment-success`);
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// const payment_verification = async (req, res) => {
//   try {
//     const {
//       razorpay_payment_id,
//       razorpay_subscription_id,
//       razorpay_signature,
//     } = req.body;

//     const user = req.user;

//     if (!user)
//       return res
//         .status(401)
//         .json({ sucess: false, message: "Not Authenticated" });

//     const userWithSub = await prisma.user.findUnique({
//       where: { id: user.id },
//       select: {
//         subscription: {
//           select: {
//             razorpaySubscriptionId: true,
//           },
//         },
//       },
//     });

//     const subscriptionId = userWithSub?.subscription?.razorpaySubscriptionId;

//     const generated_signature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
//       .update(razorpay_payment_id + "|" + subscriptionId, "utf-8")
//       .digest("hex");

//     const isAuthenticate = generated_signature === razorpay_signature;

//     if (!isAuthenticate) {
//       res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
//     }

//     await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         subscription: {
//           update: {
//             status: "active",
//           },
//         },
//       },
//     });

//     await prisma.payment.create({
//       data: {
//         razorpayPaymentId: razorpay_payment_id,
//         razorpaySignature: razorpay_signature,
//         razorpaySubscriptionId: razorpay_subscription_id,
//         status: "captured",
//         amount: 50000, // e.g. from webhook
//         userId: user.id,
//         subscriptionId: {
//           connect: { userId: user.id }, // link to user’s subscription
//         },
//       },
//     });

//     res.redirect(`${process.env.CLIENT_URL}/payment-success`);
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({ success: false, error: error.message });
//   }
// };

const cancel_subscription = async (req, res) => {
  try {
    const user = req.user;

    if (!user)
      return res
        .status(401)
        .json({ sucess: false, message: "Not Authenticated" });

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    // const subscriptionId = await prisma.subscription.findUnique({
    //   where: { id: user.id },
    //   select: { razorpaySubscriptionId: true },
    // });

    const cancel = await instance.subscriptions.cancel(subscription.razorpaySubscriptionId);    

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { 
        status: cancel.status
      },
    });

    // const payment = await prisma.payment.findUnique({
    //   where: {
    //     razorpaySubscriptionId: subscriptionId,
    //   },
    // });

    res
      .status(200)
      .json({
        success: true,
        message:
          "Subscription Cancel Successfully. You won't be charged from next month.",
      });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({
        success: false,
        message:
          "Server Error",
      });
  }
};

module.exports = {
  create_Subscription,
  payment_verification,
  getKey,
  cancel_subscription,
  getUserSubscriptions,
};
