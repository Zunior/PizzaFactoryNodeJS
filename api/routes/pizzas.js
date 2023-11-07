const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Pizza = require("../models/pizza");

router.get("/", (req, res, next) => {
  Pizza.find()
    .exec()
    .then((docs) => {
      console.log(docs);
      res.status(200).json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/", (req, res, next) => {
  const pizza = new Pizza({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    size: req.body.size,
    price: req.body.price,
  });
  pizza
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Handling POST request to /pizzas",
        createdPizza: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/:pizzaId", (req, res, next) => {
  const pizzaId = req.params.pizzaId;
  Pizza.findById(pizzaId)
    .exec()
    .then((doc) => {
      console.log("From database " + doc);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ message: "No valid pizza id provided" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:pizzaId", (req, res, next) => {
  const pizzaId = req.params.pizzaId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Pizza.updateOne({ _id: pizzaId }, { $set: updateOps })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/:pizzaId", (req, res, next) => {
  const pizzaId = req.params.pizzaId;
  Pizza.deleteOne({ _id: pizzaId })
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: NativeError,
      });
    });
});

module.exports = router;
