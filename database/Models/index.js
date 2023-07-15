const User = require("./user");
const Expense = require("./expense");

//Associations
User.hasMany(Expense);
Expense.belongsTo(User);

module.exports = {
  User,
  Expense,
};
