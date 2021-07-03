const express = require("express");
const cors = require("cors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
require("dotenv").config();

const PORT = process.env.PORT || 4000;

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
    function (accessToken, refreshToken, profile, cb) {
      console.log(accessToken, refreshToken, profile);
      return cb(null, profile);

      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
    }
  )
);

app.get("/", (req, res) => {
  res.send("server is working");
});

app.get("/failed", (req, res) => {
  res.send("Failed to login");
});

app.get("/success", (req, res) => {
  res.send("Welcome " + req.profile);
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
    res.redirect("/success");
  }
);

passport.serializeUser((profile, done) => {
  done(null, profile);
});

passport.deserializeUser((profile, done) => {
  done(null, profile);
});
