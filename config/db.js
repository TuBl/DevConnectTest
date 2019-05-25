//file that has all the connections to the mongo DB. not to clutter server.js
const mongoose = require("mongoose");
const config = require("config"); //to use global variables that i stored in default.json

const db = config.get("mongoURI");
//use try catch with async/await
const connectDB = async () => {
  try {
    //mongoose.connect returns promise
    //use new URL parse.. old one is depricated and will be removed!, createindex for another error
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    //Exit process with failure!!
    process.exit(1);
  }
};

module.exports = connectDB;
