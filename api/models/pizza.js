const mongoose = require("mongoose");

const pizzaSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: Number, required: true },
  pizzaImage: { type: String, required: false },
});

module.exports = mongoose.model("Pizza", pizzaSchema);
