const router = require("express").Router();
const passport = require("../config/passport");

//midleware

//Mount API
router.use("/login", require("./login"));
router.use("/signup", require("./signup"));
router.use("/auth", require("./auth"));
router.use("/logout", require("./logout"));

const ensureAuthenticated = async (req, res, next) => {
  console.log("is auth? ", await req.isAuthenticated());
  // console.log("Req\n", req);
  if (await req.isAuthenticated()) {
    console.log("Is authenticated");
    next();
  }
  console.log("Is NOT authenticated");
  res.status(401).json({ message: "Unauthorized User" });
};

router.use("/plaid", ensureAuthenticated, require("./plaid"));
// router.use("/plaid", require("./plaid"));

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
