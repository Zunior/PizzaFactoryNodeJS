const Pizza = require("../models/pizza");
const defaultUrl = "/pizzas";
const mongoose = require("mongoose");
const fs = require("fs");

exports.pizzas_get_all = async (req, res, next) => {
  try {
    const pizzas = await Pizza.find()
      .select("_id name price size pizzaImage")
      .exec();

    const response = {
      count: pizzas.length,
      pizzas: pizzas.map((pizza) => {
        return {
          id: pizza._id,
          name: pizza.name,
          price: pizza.price,
          size: pizza.size,
          pizzaImage: pizza.pizzaImage,
          request: {
            type: "GET",
            url:
              process.env.DOMAIN +
              ":" +
              process.env.PORT +
              defaultUrl +
              "/" +
              pizza._id,
          },
        };
      }),
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

// exports.pizzas_get_all_1 = (req, res, next) => {
//   Pizza.find()
//     .select("_id name price size pizzaImage")
//     .exec()
//     .then((docs) => {
//       const response = {
//         count: docs.length,
//         pizzas: docs.map((doc) => {
//           return {
//             id: doc._id,
//             name: doc.name,
//             price: doc.price,
//             size: doc.size,
//             pizzaImage: doc.pizzaImage,
//             request: {
//               type: "GET",
//               url:
//                 process.env.DOMAIN +
//                 ":" +
//                 process.env.PORT +
//                 defaultUrl +
//                 "/" +
//                 doc._id,
//             },
//           };
//         }),
//       };
//       res.status(200).json(response);
//     })
//     .catch((err) => {
//       res.status(500).json({
//         error: err,
//       });
//     });
// };

exports.pizzas_create_new = (req, res, next) => {
  const pizza = new Pizza({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    size: req.body.size,
    price: req.body.price,
    pizzaImage: req.file?.path,
  });
  pizza
    .save()
    .then((result) => {
      res.status(201).json({
        message: "New pizza created succesfully",
        createdPizza: {
          id: result._id,
          name: result.name,
          price: result.price,
          size: result.size,
          pizzaImage: result.pizzaImage,
          request: {
            type: "GET",
            url:
              process.env.DOMAIN +
              ":" +
              process.env.PORT +
              defaultUrl +
              "/" +
              result._id,
          },
        },
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.pizzas_get_by_id = (req, res, next) => {
  const pizzaId = req.params.pizzaId;
  Pizza.findById(pizzaId)
    .select("_id name price size pizzaImage")
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          pizza: doc,
          request: {
            type: "GET",
            description: "Get all pizzas",
            url: process.env.DOMAIN + ":" + process.env.PORT + defaultUrl,
          },
        });
      } else {
        res.status(404).json({ message: "No valid pizza id provided" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.pizzas_update_by_id = (req, res, next) => {
  const pizzaId = req.params.pizzaId;
  Pizza.findByIdAndUpdate(pizzaId, { $set: req.body }, { new: true })
    .then(
      res.status(200).json({
        message: "Pizza updated",
        request: {
          type: "GET",
          description: "Get details",
          url:
            process.env.DOMAIN +
            ":" +
            process.env.PORT +
            defaultUrl +
            "/" +
            pizzaId,
        },
      })
    )
    .catch((err) => res.status(500).json({ error: err }));
};

exports.pizzas_delete_by_id = (req, res, next) => {
  const pizzaId = req.params.pizzaId;
  Pizza.findById(pizzaId)
    .select("pizzaImage")
    .exec()
    .then((doc) => {
      if (doc) {
        return doc.pizzaImage;
      }
    })
    .then((imageUrl) => {
      Pizza.deleteOne({ _id: pizzaId })
        .exec()
        .then((result) => {
          if (imageUrl) {
            fs.unlinkSync(imageUrl);
          }
          res.status(200).json(result);
        })
        .catch((err) => {
          res.status(500).json({
            error: err,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};
