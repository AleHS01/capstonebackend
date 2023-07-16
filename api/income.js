const router = require("express").Router();
const { User, Income } = require("../database/Models");
const bodyParser = require("body-parser");

router.post("/get", async (req, res, next) => {
  //req.user stores  the entire user that has been authenticated inside of it
  const incomes = await Income.findAll({ where: { UserId: req.user.id } });

  res.status(200).json(incomes);
});

router.post("/", bodyParser.json(), async (req, res, next) => {
  try {
    console.log(req.body); // Array of incomes expected from the form

    const newIncomeData = req.body.incomes.map((income) => ({
      ...income,
      UserId: req.user.id,
    }));
    console.log("new Expenses with Id:\n", newIncomeData);
    const newIncome = await Expense.bulkCreate(newIncomeData);
    res.status(201).json(newIncome);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
