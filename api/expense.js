const router = require("express").Router();
const e = require("express");
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

    // for (let i = 0; i < newExpensesData.length; i++) {
    //   const expense = newExpensesData[i];
    //   //if expense.id is defined then: find an updated
    //   if (expense.id) {
    //     const updateExpense = await Expense.findByPk(expense.id);

    //     updateExpense.expense_name = expense.expense_name;
    //     updateExpense.expense_value = expense.expense_value;

    //     updateExpense.save();
    //   } else {
    //     //if is is not in the db (dont have an id) then create
    //     await Expense.create(expense);
    //   }
    // }
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

    //send back to frontend to update the state
    const expenses = await Expense.findAll({ where: { UserId: req.user.id } });

    res.status(201).json(expenses);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/:id", bodyParser.json(), async (req, res, next) => {
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

router.delete("/:id", bodyParser.json(), async (req, res, next) => {
  try {
    const expenseToDelete = await Expense.findByPk(req.params.id);
    await expenseToDelete.destroy();
    res.status(201).send("Deleted Successful");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
