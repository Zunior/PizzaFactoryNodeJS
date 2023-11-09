const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const Pizza = require("../models/pizza");

const defaultUrl = "/pizzas";

router.get("/", (req, res, next) => {
  Pizza.find()
    .select("_id name price size pizzaImage")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        pizzas: docs.map((doc) => {
          return {
            id: doc._id,
            name: doc.name,
            price: doc.price,
            size: doc.size,
            pizzaImage: doc.pizzaImage,
            request: {
              type: "GET",
              url:
                process.env.DOMAIN +
                ":" +
                process.env.PORT +
                defaultUrl +
                "/" +
                doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/", upload.single("pizzaImage"), (req, res, next) => {
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
});

router.get("/:pizzaId", (req, res, next) => {
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
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/:pizzaId", (req, res, next) => {
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
            error: NativeError,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

module.exports = router;
