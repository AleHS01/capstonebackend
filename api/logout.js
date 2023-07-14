// const express = require("express");
// const router = express.Router();

// module.exports = (passport) => {
//   //   router.post("/", (req, res, next) => {
//   //     req.logout((err) => {
//   //       if (err) {
//   //         return next(err);
//   //       }
//   //       res.send("Logout successful");
//   //     });
//   //   });
//   router.post("/", (req, res, next) => {
//     req.session.destroy(function (err) {
//       res.send("Logout successful");
//     });
//     req.logout((err) => {
//       if (err) {
//         return next(err);
//       }
//       console.log("Logout successful in req.logut");
//     });
//   });

//   return router;
// };

const express = require("express");
const router = express.Router();

module.exports = (passport) => {
  router.post("/", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      console.log("Logout successful in req.logout");

      req.session.destroy(function (err) {
        if (err) {
          console.log(err);
          res.status(500).send("Error occurred during logout");
        } else {
          res.send("Logout successful");
        }
      });
    });
  });

  return router;
};

// const express = require("express");
// const router = express.Router();

// module.exports = (passport) => {
//   router.post("/", (req, res, next) => {
//     console.log("we are in logut then crash");
//     //first logout, then detroy the session
//     req.logout((err) => {
//       if (err) {
//         return next(err);
//       }
//       console.log("Logout successful in req.logut");
//     });
//     req.session.destroy(function (err) {
//       if (err) {
//         console.log(err);
//         res.status(500).send("Error occurred during logout");
//       } else {
//         res.send("Logout successful");
//       }
//     });
//   });

//   return router;
// };
