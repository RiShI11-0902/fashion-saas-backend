const express = require("express");
const {
  register,
  login,
  authMiddleware,
  logout,
  checkAuth,
} = require("../controllers/auth");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma-client");

const router = express.Router();
router.get("/check", checkAuth, (req, res) => {
  res.json({ isAuthenticated: true, user: req.user });
});

router.post("/register", register);
router.post("/login", login);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const { displayName, emails, id, photos } = req.user;
      const email = emails[0].value;

      // 1. Check if user already exists in DB
      let user = await prisma.user.findUnique({
        where: { email },
      });

      // 2. If not, create new user
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: displayName,
            email,
            googleId: id,
            avatar: photos?.[0]?.value || null,
          },
        });
      }

      // 3. Create JWT
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // 4. Set cookie + redirect
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in prod
        sameSite: "none", // must be "none" for cross-domain
        maxAge: 7 * 24 * 60 * 60 * 1000, // example: 7 days
      });
      //   res.json({token: token, user: user})
      res.redirect(`${process.env.CLIENT_URL}/auth/callback`);
    } catch (err) {
      console.error("Error in Google callback:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);
router.get("/profile", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});
router.post("/logout", logout);

module.exports = router;
