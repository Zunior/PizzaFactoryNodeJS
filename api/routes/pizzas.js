const express = require("express");
const router = express.Router();
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const PizzasController = require("../controllers/pizzas");

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

router.get("/", PizzasController.pizzas_get_all);

router.post(
  "/",
  checkAuth,
  upload.single("pizzaImage"),
  PizzasController.pizzas_create_new
);

router.get("/:pizzaId", PizzasController.pizzas_get_by_id);

router.patch("/:pizzaId", checkAuth, PizzasController.pizzas_update_by_id);

router.delete("/:pizzaId", checkAuth, PizzasController.pizzas_delete_by_id);

module.exports = router;

// router.patch("/:pizzaId", (req, res, next) => {
//   const pizzaId = req.params.pizzaId;
//   const updateOps = {};
//   for (const ops of req.body) {
//     updateOps[ops.propName] = ops.value;
//   }
//   Pizza.updateOne({ _id: pizzaId }, { $set: updateOps })
//     .exec()
//     .then((result) => {
//       res.status(200).json({
//         message: "Pizza updated",
//         request: {
//           type: "GET",
//           description: "Get details",
//           url:
//             process.env.DOMAIN +
//             ":" +
//             process.env.PORT +
//             defaultUrl +
//             "/" +
//             pizzaId,
//         },
//       });
//     })
//     .catch((err) => {
//       res.status(500).json({
//         error: err,
//       });
//     });
// });
