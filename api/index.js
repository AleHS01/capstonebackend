const router = require("express").Router();

module.exports = (passport) => {
  router.use("/login", require("./login")(passport));
  router.use("/signup", require("./signup"));
  router.use("/user", require("./user"));
  router.use("/logout", require("./logout")(passport));
  router.use("/plaid", require("./plaid"));
  router.use("/expense", require("./expense"));

  router.use((req, res, next) => {
    const error = new Error("404 Not Found");
    error.status = 404;
    next(error);
  });
  return router;
};
