const express = require("express");
const router = express.Router();
const { User, Expense } = require("../database/Models");

module.exports = (passport) => {
  // router.post("/", (req, res, next) => {
  //   passport.authenticate("local", (error, user, info) => {
  //     if (error) {
  //       return next(error);
  //     }
  //     if (!user) {
  //       return res.send("No User Exists");
  //     }
  //     req.logIn(user, (error) => {
  //       if (error) {
  //         return next(error);
  //       }
  //       const user = await = User.findByPk(req.user.id);
  //       res.status(200).json({ user });
  //       console.log("Just Logged In User", user);
  //     });
  //   })(req, res, next);
  // });
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
        User.findByPk(req.user.id, { include: Expense })
          .then((user) => {
            res.status(200).json({ user });
            console.log("Just Logged In User", user);
          })
          .catch((error) => {
            console.log(error);
            next(error);
          });
      });
    })(req, res, next);
  });

  return router;
};
