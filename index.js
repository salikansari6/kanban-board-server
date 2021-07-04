const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");
const User = require("./models/User");
const { deserializeUser } = require("passport");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
require("dotenv").config();

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }, () => {
  console.log("connected to DB");
});

app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/callback/",
    },
    async function (accessToken, refreshToken, profile, cb) {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        const newUser = new User({
          name: profile.displayName,
          photo: profile.photos[0].value,
          email: profile.email,
          googleId: profile.id,
        });
        user = await newUser.save();
      }

      cb(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user with id " + id);
  try {
    const deserializedUser = await User.findById(id);
  } catch (err) {
    done(err, null);
  }
  if (deserializedUser) {
    done(null, deserializedUser);
  }
});

app.get("/", (req, res) => {
  res.send("server is working");
});

app.get("/failed", (req, res) => {
  res.send("Failed to login");
});

app.get("/success", (req, res) => {
  res.send("Welcome " + req.user);
});

app.get(
  "/auth/google/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback/",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000");
  }
);
