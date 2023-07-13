const router = require("express").Router();

router.get("/", (req, res, next) => {
  console.log("Logout and redirect");
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    req.session.destroy();
    res.redirect("/api/login");
  });
});

// router.get("/", (req, res, next) => {
//   res.status(200).send("Log out sucess");
// });

module.exports = router;
