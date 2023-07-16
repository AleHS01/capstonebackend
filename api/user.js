const router = require("express").Router();
const { User, Expense } = require("../database/Models");
const authenticateUser = require("../middleware/authenticateUser");

router.get("/", authenticateUser, async (req, res, next) => {
  //req.user stores  the entire user that has been authenticated inside of it
  const user = await User.findByPk(req.user.id, {
    include: Expense,
  });
  console.log("user to be return:\n", user);
  res.status(200).json(user);
});

module.exports = router;
