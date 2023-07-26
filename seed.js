const User = require("./database/Models/user");

const seedUser = [
  { username: "shoaib001", first_name:"Shoaib",last_name:"Ashfaq", email: "shoaibashfaq@gmail.com", password: "shoaib" },
  { username: "hamza1", first_name:"Hamza",last_name:"Kahliq", email: "hikhail@yahoo.com", password: "hamza" },
  { username: "ghulam69", first_name:"Ghulam",last_name:"Ahmed", email: "hafiz@gmail.com", password: "ghulam" },
 
];

const seed = async () => {
  await User.bulkCreate(seedUser);
};

seed().then(() => process.exit());
