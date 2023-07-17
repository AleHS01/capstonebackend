const User = require("./user");
const Expense = require("./expense");
const Income = require("./income")
const Budget = require("./budget")

//Associations
User.hasMany(Expense);
User.hasMany(Income)
User.hasMany(Budget)
Budget.belongsTo(User)
Expense.belongsTo(User);
Income.belongsTo(User)
Budget.hasMany(Expense)
Expense.belongsTo(Budget)

module.exports = {
  User,
  Expense,
  Income,
  Budget
};
