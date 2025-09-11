const  jwt =  require("jsonwebtoken");
const  bcrypt =  require ("bcrypt");
const  prisma = require ("../utils/prisma-client");

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) =>  {
  const { email, password, name } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name }
  });

  res.json({ message: "User registered", user: { id: user.id, email: user.email, name: user.name } });
}

const login = async (req, res) =>  {
  const { email, password } = req.body;

  console.log(email,password);
  
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ token,user });
}

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
}

const checkAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ isAuthenticated: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user
    next();
  } catch {
    return res.status(401).json({ isAuthenticated: false });
  }
};


module.exports = {
    register,login,authMiddleware,checkAuth
}