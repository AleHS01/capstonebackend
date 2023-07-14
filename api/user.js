const router = require("express").Router();

router.get("/", (req, res, next) => {
  //req.user stores  the entire user that has been authenticated inside of it
  res.send(req.user);
});

module.exports = router;
