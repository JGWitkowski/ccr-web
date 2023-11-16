const mongoose = require("mongoose");

const Clam = mongoose.model(
  "Clam",
  new mongoose.Schema({
    name: String,
    address: String,
  })
);

module.exports = User;
