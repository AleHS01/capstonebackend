const router = require("express").Router();
const { User, Expense } = require("../database/Models");
const bodyParser = require("body-parser");

router.post("/get", async (req, res, next) => {
  //req.user stores  the entire user that has been authenticated inside of it
  const expenses = await Expense.findAll({ where: { UserId: req.user.id } });

  res.status(200).json(expenses);
});

router.post("/", bodyParser.json(), async (req, res, next) => {
  try {
    console.log(req.body); // Array of expenses expected from the form

    const newExpensesData = req.body.expenses.map((expense) => ({
      ...expense,
      UserId: req.user.id,
    }));
    console.log("new Expenses with Id:\n", newExpensesData);
    const newExpenses = await Expense.bulkCreate(newExpensesData);
    res.status(201).json(newExpenses);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
