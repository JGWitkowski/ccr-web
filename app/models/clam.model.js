const mongoose = require("mongoose");

const Clam = mongoose.model(
  "Clam",
  new mongoose.Schema({
    name: String,
    address: String,
    consistencyScore: Number,
    volumeScore: Number,
    tasteScore: Number,
    priceScore: Number,
    price: Number || null,
    cuisine: String || null,
    awardWinning: String || null,
    notes: String || null,
  })
);

module.exports = Clam;
