const mongoose = require("mongoose");

const ClamUser = mongoose.model(
  "ClamUser",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
  })
);

module.exports = ClamUser;
