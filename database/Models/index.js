const User = require("./user");
const Expense = require("./expense");
const Income = require("./income")
const Budget = require("./budget")

//Associations
User.hasMany(Expense);
User.hasMany(Income)
User.hasMany(Budget)
Budget.hasOne(User)
Expense.belongsTo(User);
Income.belongsTo(User)

module.exports = {
  User,
  Expense,
  Income,
  Budget
};
