const User = require("./user");
const Expense = require("./expense");
const Income = require("./income")

//Associations
User.hasMany(Expense);
User.hasMany(Income)
Expense.belongsTo(User);
Income.belongsTo(User)

module.exports = {
  User,
  Expense,
  Income
};
