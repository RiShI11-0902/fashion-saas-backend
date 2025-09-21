const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../utils/prisma-client");

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in prod
    sameSite: "none", // must be "none" for cross-domain
    maxAge: 7 * 24 * 60 * 60 * 1000, // example: 7 days
    domain: ".shopmonk.shop",
  });

  res.json({
    message: "User registered",
    user: { id: user.id, email: user.email, name: user.name },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "You are not registered" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only true on HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/", // make it available everywhere
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: ".shopmonk.shop",
  });

  res.json({ token, user });
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const checkAuth = async (req, res, next) => {
  const token = req.cookies.token;  
  
  if (!token) return res.status(401).json({ isAuthenticated: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let userProfile = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (userProfile) {
      const { password, ...safeUser } = userProfile;
      userProfile = safeUser;
    }
    
    req.user = userProfile; // attach user
    next();
  } catch {
    return res.status(401).json({ isAuthenticated: false });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token", {
    secure: process.env.NODE_ENV === "production", // only true on HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/", // make it available everywhere
    domain: ".shopmonk.shop",
  });
  return res.json({ message: "Logged out successfully" });
};

module.exports = {
  register,
  login,
  authMiddleware,
  checkAuth,
  logout,
};
