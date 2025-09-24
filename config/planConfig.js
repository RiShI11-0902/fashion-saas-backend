// plans config (only backend should know real prices)
 exports.PLANS = {
  Free: {
    amount: 0,
    currency: "INR",
    features: ["10 products", "1 AI generation"],
    credits:1
  },
  Starter: {
    amount: 1000,
    currency: "INR",
    features: ["40 products", "30 AI generations"],
    id:process.env.STARTER_PLAN_ID,
    credits:40
  },
  Premium: {
    amount: 3000,
    currency: "INR",
    features: ["Unlimited products", "200 AI generations"],
    id:process.env.PREMIUM_PLAN_ID,
    credits:200
  }
};