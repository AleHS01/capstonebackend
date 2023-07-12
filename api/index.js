const router = require("express").Router();
const passport = require("../config/passport");

//Mount API
router.use("/login", require("./login"));
router.use("/signup", require("./signup"));
router.use("/auth", require("./auth"));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    const accessToken = req.user.accessToken;
    console.log("Access Token", accessToken);
    console.log("User", req.user);
    res.redirect("/");
  }
);

// 404 Handling
router.use((req, res, next) => {
  const error = new Error("404 Not Found");
  error.status = 404;
  next(error);
});

module.exports = router;
