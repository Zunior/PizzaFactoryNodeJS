const mongoose = require("mongoose");

const pizzaSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number,
  size: Number,
});

module.exports = mongoose.model("Pizza", pizzaSchema);
