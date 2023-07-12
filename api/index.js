const router = require("express").Router();

//Mount API
// router.use("/login", require("./login"));
router.use("/signup", require("./signup"));

// 404 Handling
router.use((req, res, next) => {
  const error = new Error("404 Not Found");
  error.status = 404;
  next(error);
});

module.exports = router;
