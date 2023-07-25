const router = require("express").Router();

module.exports = (passport) => {
  router.use("/login", require("./login")(passport));
  router.use("/signup", require("./signup"));
  router.use("/user", require("./user"));
  router.use("/logout", require("./logout")(passport));
  router.use("/plaid", require("./plaid"));
  router.use("/expense", require("./expense"));
  router.use("/income", require("./income"));
  router.use("/budget", require("./budget"));
  router.use("/transactions", require("./transaction"));
  router.use("/group", require("./group"));
  router.use("/stripe", require("./stripe"));

  router.use((req, res, next) => {
    const error = new Error("404 Not Found");
    error.status = 404;
    next(error);
  });
  return router;
};
