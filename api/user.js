const router = require("express").Router();
const { User, Expense, Group, Transaction } = require("../database/Models");
const authenticateUser = require("../middleware/authenticateUser");

router.get("/", authenticateUser, async (req, res, next) => {
  //req.user stores  the entire user that has been authenticated inside of it
  const user = await User.findByPk(req.user.id, {
    include: [Expense, Group, Transaction],
  });
  console.log("user to be return:\n", user);
  res.status(200).json(user);
});

router.put("/order/:id", authenticateUser, async (req, res, next) => {
  const { orderNum } = req.body;
  const id = req.params.id;
  try {
    const user = await User.findByPk(id);
    user.committee_order = orderNum;
    await user.save();

    res.status(200).send("Order Updated");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/remove_order/:id", authenticateUser, async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findByPk(id);
    user.committee_order = null;
    await user.save();

    res.status(200).send("Order Remove");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
