import { Router } from "express";
import Product from "../models/Product.js";
import { authenticateToken, checkAdmin } from "./authRoutes.js";

const productRouter = Router();

productRouter.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

productRouter.post("/", authenticateToken, checkAdmin, async (req, res) => {
  try {
    let product = new Product({
      name: req.body.name,
      image: req.body.image,
      price: req.body.price,
    });

        if (req.body.description) product.description = req.body.description;

        product = await product.save();

        res.status(201).send(product);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

productRouter.patch("/:id", authenticateToken, checkAdmin, async (req, res) => {
  try {
    let product = Product.findById(req.body.id);

    if (!product)
      return res
        .status(404)
        .send({ message: "No product with id " + req.body.id });

        if (req.body.image) product.image = req.body.image;
        if (req.body.price) product.price = req.body.price;
        if (req.body.name) product.name = req.body.name;
        if (req.body.description) product.description = req.body.description;

    product = await product.save();

    res.send(product);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});




productRouter.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).send({ message: "Invalid product id" });
    res.send(product);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

export default productRouter;
