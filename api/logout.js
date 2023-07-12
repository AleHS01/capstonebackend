const router = require("express").Router();

router.get("/", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    res.redirect("/api/login");
  });
});

// router.get("/", (req, res, next) => {
//   res.status(200).send("Log out sucess");
// });

module.exports = router;
