const express = require("express");
const router = express.Router();
const { User, Expense } = require("../database/Models");
const authenticateUser = require("../middleware/authenticateUser");
require("dotenv").config();
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
        console.log("req.user inside req.logIn:", req.user);
        User.findByPk(req.user.id, { include: Expense })
          .then((user) => {
            res.status(200).json(user);
            console.log("Just Logged In User", user);
          })
          .catch((error) => {
            console.log(error);
            next(error);
          });
      });
      console.log("------------req.user in login--------:\n", req.user);
    })(req, res, next);
  });

  // router.post(
  //   "/",
  //   passport.authenticate("local", {
  //     failureRedirect: `${process.env.FRONTEND_URL}/login/`,
  //     failureMessage: "Cannot login to Google, please try again later!",
  //     successRedirect: `${process.env.FRONTEND_URL}/login/success`,
  //   }),
  //   function (req, res, next) {
  //     console.log("req.user in login - local:\n", req.user);
  //     User.findByPk(req.user.id, { include: Expense })
  //       .then((user) => {
  //         res.status(200).json(user);
  //         console.log("Just Logged In User", user);
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //         next(error);
  //       });
  //   }
  // );

  router.get(
    "/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
  );

  router.get(
    "/google_callback",
    passport.authenticate("google", {
      failureRedirect: `${process.env.FRONTEND_URL}/login/`,
      failureMessage: "Cannot login to Google, please try again later!",
      successRedirect: `${process.env.FRONTEND_URL}/login/success`,
    }),
    function (req, res, next) {
      // Successful authentication, redirect home.
      console.log("req.user in google_callback:\n", req.user);
      User.findByPk(req.user.id, { include: Expense })
        .then((user) => {
          res.status(200).json(user);
          console.log("Just Logged In User", user);
        })
        .catch((error) => {
          console.log(error);
          next(error);
        });
      // res.send("login sucess with google");
      // res.redirect("http://localhost:3000/user");
    }
  );

  return router;
};
