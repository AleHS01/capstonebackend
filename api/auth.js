const User = require("../database/Models/user");
const router = require("express").Router();
const passport = require("../config/passport");

//authenticate user
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   function (req, res) {
//     // Successful authentication, redirect home.
//     const accessToken = req.user.accessToken;
//     console.log("Access Token", accessToken);
//     console.log("User", req.user);
//     res.redirect("/");
//   }
// );

module.exports = router;
