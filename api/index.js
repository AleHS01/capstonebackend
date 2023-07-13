const router = require("express").Router();
const passport = require("../config/passport");

//midleware
const ensureAuthenticated = (req, res, next) => {
  console.log("is auth? ", req.isAuthenticated());
  if (req.isAuthenticated()) {
    console.log("Is authenticated");
    return next();
  }
  console.log("Is NOT authenticated");
  res.status(401).json({ message: "Unauthorized User" });
};

//Mount API
router.use("/login", require("./login"));
router.use("/signup", require("./signup"));
router.use("/auth", require("./auth"));
router.use("/logout", require("./logout"));
router.use("/plaid", ensureAuthenticated, require("./plaid"));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/api/auth/me");
  }
);

// 404 Handling
router.use((req, res, next) => {
  const error = new Error("404 Not Found");
  error.status = 404;
  next(error);
});

module.exports = router;
