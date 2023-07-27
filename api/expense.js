const router = require("express").Router();
const { User, Expense, Budget } = require("../database/Models");
const authenticateUser = require("../middleware/authenticateUser");
const { use } = require("passport");

router.get("/getExpenses", authenticateUser, async (req, res, next) => {
  //req.user stores  the entire user that has been authenticated inside of it
  try {
    const expenses = await Expense.findAll({ where: { UserId: req.user.id } });
    res.status(200).json(expenses);
  } catch (error) {
    console.log(error);
  }
});

router.post("/", authenticateUser, async (req, res, next) => {
  try {
    console.log(req.body); // Array of expenses expected from the form

    const newExpensesData = req.body.expenses.map((expense) => ({
      ...expense,
      UserId: req.user.id,
    }));
    for (const expense of newExpensesData) {
      // If expense.id is defined then update
      if (expense.id) {
        const updateExpense = await Expense.findByPk(expense.id);

        updateExpense.expense_name = expense.expense_name;
        updateExpense.expense_value = expense.expense_value;

        await updateExpense.save();
      } else {
        // If it doesn't have an id, then create a new record
        await Expense.create(expense);
      }
    }

    console.log("new Expenses with Id:\n", newExpensesData);
    // const newExpenses = await Expense.bulkCreate(newExpensesData);
    res.status(201).json(newExpensesData);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    console.log(req.body); //expected a expense object

    const updateExpense = await Expense.findByPk(req.params.id);
    updateExpense.expense_name = req.body.expense_name;
    updateExpense.expense_value = req.body.expense_value;
    updateExpense.save();
    res.status(201).json(updateExpense);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const expenseToDelete = await Expense.findByPk(req.params.id);
    await expenseToDelete.destroy();
    res.status(200).send("Expense Delete Successfully");
  } catch (error) {
    console.log("error");
    next(error);
  }
});

router.post("/addExpense", authenticateUser, async (req, res, next) => {
  try {
    const { name, amount, budgetId } = req.body; // we get budgetId from req.body

    const userId = req.user.id;

    const budget = await Budget.findByPk(budgetId); // you find the budget using budgetId

    if (!budget) {
      return res.status(404).send("Budget not found");
    }

    // then you create the expense
    const expense = await Expense.create({
      expense_name: name,
      expense_value: amount,
      UserId: userId,
    });

    // and associate the expense with the budget.
    await budget.addExpense(expense);
    await expense.reload();

    // respond with the newly created expense
    res.json(expense);
  } catch (error) {
    // pass the error to your error handling middleware
    next(error);
  }
});

router.get(
  "/totalExpenses/:budgetId",
  authenticateUser,
  async (req, res, next) => {
    const budgetId = req.params.budgetId;
    console.log(budgetId);
    try {
      const expenses = await Expense.findAll({ where: { BudgetId: budgetId } });
      console.log(expenses);

      var total = 0.0;
      expenses.forEach(function (item) {
        console.log(item.expense_value);
        total = total + parseFloat(item.expense_value);
      });
      console.log("total", total);
      res.status(200).json(total);
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = router;
