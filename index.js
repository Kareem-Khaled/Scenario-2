// include it if we are just in the development mode
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// to start server
const express = require("express");
const app = express();

// cookies
const session = require("express-session");

// to use http mehods like (put, patch, delete)
const methodOverride = require("method-override");

// get the path to run from any dir
const path = require("path");

const ejsMate = require("ejs-mate");

// to use mongodb
const mongoose = require("mongoose");

// mongo sessions
const MongoDBStore = require("connect-mongo");

// authanecation package
const passport = require("passport");
const localStrategy = require("passport-local");

// to start connection with mongodb
// mongoose
//     .connect(process.env.DATABASE_URL)
//     .then(() => {
//         console.log("MONGO CONNECTION OPEN!!!");
//     })
//     .catch((err) => {
//         console.log("OH NO MONGO CONNECTION ERROR!!!!");
//         console.log(err);
//     });


// Views folder and EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// to parse form data in POST request body
app.use(express.urlencoded({ extended: true }));

// To 'fake' put/patch/delete requests
app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);

// to use static files in public folder
app.use(express.static(path.join(__dirname, "public")));

// const sessionConfig = {
//     // store sessions in db instead of memory
//     store: MongoDBStore.create({
//         mongoUrl: process.env.DATABASE_URL,
//         secret: process.env.SECRET,
//         touchAfter: 24 * 60 * 60 // not to save it every time the page is refreshed
//     }),
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         httpOnly: true,
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7,
//     },
// };
// app.use(session(sessionConfig));

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new localStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// to send data to all templates (local variables)
// app.use((req, res, next) => {
//     res.locals.currentUser = req.user;
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     next();
// });

// app.use("/", userRoutes);
// app.use("/", postRoutes);
// app.use("/request/", requestRoutes);
// app.use("/chat/", chatRoutes);
// app.use('/post/:postId/comments/', commentRoutes);

app.get("/", (req, res) => {
    res.render("doctor/index");
});

app.get("/doctor", (req, res) => {
    res.render("doctor/index");
});

app.get("/history", (req, res) => {
    res.render("doctor/history");
});

app.get("/online-booking", (req, res) => {
    res.render("doctor/online-booking");
});

app.all("*", (req, res, next) => {
    res.render("404");
});

// app.use((err, req, res, next) => {
//     const { statusCode = 400, message = "something went wrong" } = err;
//     res.status(statusCode).render("error", { err });
// });

app.listen(process.env.PORT, () => {
    console.log(`ON PORT ${process.env.PORT}`);
});