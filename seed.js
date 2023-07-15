const User = require("./database/Models/user");

const seedUser = [
  { username: "hamza", email: "hamzakhaliq@gmail.com", password: "hikhal56" },
  { username: "Ale", email: "Ale@gmail.com", password: "ale56" },
];

const seed = async () => {
  await User.bulkCreate(seedUser);
};

seed().then(() => process.exit());
