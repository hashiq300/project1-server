import { Router } from "express";
import { authenticateToken } from "./authRoutes.js";
import Cart from "../models/Cart.js";

const cartRouter = Router();

cartRouter.get("/", authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user_id: req.user._id,
        }).populate("inventory.product");

        if (!cart)
            return res
                .status(404)
                .send({ message: "No cart has been created" });

        return res.send(cart);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

cartRouter.post("/", authenticateToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({
            user_id: req.user._id,
        });
        if (!cart) {
            const cart = await Cart.create({
                user_id: req.user._id,
                inventory: req.body.inventory,
            });

            return res
                .status(201)
                .send({ message: "Cart successfully created" });
        }
        cart.inventory = req.body.inventory;
        cart.save();
        return res.send({ message: "Cart successfully updated" });
    } catch (err) {
        return res.status(400).send({ message: err.message });
    }
});

cartRouter.post("/:productid", authenticateToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({
            user_id: req.user._id,
        });
        if (!cart) {
            const cart = await Cart.create({
                user_id: req.user._id,
                inventory: [
                    {
                        product: req.params.productid,
                        count: req.body.count,
                    },
                ],
            });

            return res
                .status(201)
                .send({ message: "Cart successfully created" });
        }
        const product = cart.inventory.find((products) => {
            return products.product._id.toString() === req.params.productid;
        });

        console.log(product);

        if (product === undefined) {
            cart.inventory.push({
                count: req.body.count,
                product: req.params.productid,
            });
            await cart.save();
            return res.send({ message: "Cart successfully updated" });
        }

        product.count = req.body.count;

        await cart.save();
        return res.send({ message: "Cart successfully updated" });
    } catch (err) {
        return res.status(400).send({ message: err.message });
    }
});

cartRouter.delete("/", authenticateToken, async (req, res) => {
    try {
        await Cart.deleteMany({
            user_id: req.user._id,
        });

        res.send({ message: "Successfully deleted" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

export default cartRouter;
