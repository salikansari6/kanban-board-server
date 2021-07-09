const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("cookie-session");
const User = require("./models/User");
const TaskCollection = require("./models/TaskCollection");
const app = express();

require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  session({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_SECRET],
  })
);
app.use(passport.initialize());
app.use(passport.session());

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
        await TaskCollection.create({
          userId: user._id,
          tasks: [
            { title: "To-Do", columnColor: "red", items: [] },
            { title: "In-Progress", columnColor: "yellow", items: [] },
            { title: "Done", columnColor: "green", items: [] },
          ],
        });
      }

      cb(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  let deserializedUser;
  try {
    deserializedUser = await User.findById(id);
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
    res.redirect("/success");
  }
);

app.use("/tasks", require("./routes/tasks"));
