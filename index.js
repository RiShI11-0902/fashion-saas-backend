const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const storeRoutes = require('./routes/store');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const modelRoutes = require('./routes/ai-model');
const cookieParser = require("cookie-parser");
const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy;

dotenv.config();
const app = express();
app.use(cookieParser());

const origins = [
  "https://shopmonk.shop",
]

app.use(
  cors({
    origin: (origin , callback)=>{
      if(!origin || origins.includes(origin)){
        callback(null, true); 
      } else {
        callback(new Error("Not allowed by CORS")); // Reject the request
      }
    }, // allow frontend
    credentials: true,               // allow cookies/auth headers
  })
);
app.use(express.json());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

app.use(passport.initialize());



app.use("/api/auth", authRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/generate-model', modelRoutes);




app.get("/", (req,res)=>{
    res.send("Hello")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
