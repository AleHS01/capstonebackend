const router = require("express").Router();

router.post("/", (req, res, next) => {
  req.logout();

  res.redirect("/login");
});

module.exports = router;
