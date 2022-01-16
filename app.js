if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utility/ExpressError");

const User = require("./models/user");
// const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");
const userRoutes = require("./routes/userRoute");



const MongoStore = require("connect-mongo");
// const MongoDBStore = require("connect-mongo")(session);

const dbUrl = process.env.MongoURL || "mongodb://localhost:27017/tourbox";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);
const secret = process.env.SECRET || "thisshouldbeabettersecret!";

// const store = new MongoDBStore({
//   url: dbUrl,
//   secret,
//   touchAfter: 24 * 60 * 60
// });

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 2300,
  secret,
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: false, // this was false I made it .// don't create session until something stored
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());


app.use((req, res, next) => {
  res.locals.currentUser = req.user; // this for session logged in or for
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);

app.get("/", (req, res) => {
  res.render("login");
});

// This is mystry I need add this on project
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// default error handler..
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Saomething Went Wrong";
  res.status(statusCode).render("error", { err });
});

// const port = process.env.PORT || 5000;
const port = 5000;


app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
