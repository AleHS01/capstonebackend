const express = require("express");
const router = express.Router();

module.exports = (passport) => {
  router.post("/", (req, res, next) => {
    passport.authenticate("local", (error, user, info) => {
      if (error) {
        return next(error);
      }
      if (!user) {
        return res.send("No User Exists");
      }
      req.logIn(user, (error) => {
        if (error) {
          return next(error);
        }
        res.send(req.user);
        console.log("Just Logged In User", req.user);
      });
    })(req, res, next);
  });

  return router;
};
