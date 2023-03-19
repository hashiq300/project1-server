import { Router } from "express";
import { authenticateToken, checkAdmin } from "./authRoutes.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";
import Address from "../models/Address.js";

const orderRouter = Router();

orderRouter.get("/", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("userType");

        if (user && user.userType === "ADMIN") {
            const orders = await Order.find();
            return res.send(orders);
        }

        const orders = await Order.find({
            user_id: req.user._id,
        }).populate("order_items", ["name", "price", "image"]);

        res.send(orders);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

orderRouter.post("/", authenticateToken, async (req, res) => {
    try {
        const address = await Address.exists({
            user_id: req.user._id,
        });

        if (!address)
            return res.status(403).send({ message: "Address was not updated" });

        const cart = await Cart.findOne({
            user_id: req.user._id,
        });

        if (!cart)
            return res.status(400).send({ message: "Cart doen't exist" });

        if (cart.inventory.length === 0) {
            return res.status(400).send({ message: "Inventory is empty" });
        }

        const order = await Order.create({
            user_id: req.user._id,
            order_items: cart.inventory,
        });

        await Cart.findOneAndDelete({
            user_id: req.user._id,
        });

        res.status(201).send(order);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

orderRouter.patch("/cancel", authenticateToken, async (req, res) => {
    try {
        if (!req.body.orderId)
            return res
                .status(400)
                .send({ message: "no order_id have been provided" });

        const order = await Order.findById(req.body.orderId);

        if (!order)
            return res
                .status(404)
                .send({ message: "No order available with id" });

        if (order.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).send({ message: "Forbidden to cancel" });
        }
        if (order.status === "CANCELLED")
            return res
                .status(400)
                .send({ message: "The order has been already cancelled" });

        order.status = "CANCELLED";
        order.save();

        return res.send({ message: "Order has been successfully cancelled" });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

orderRouter.patch("/:id", authenticateToken, checkAdmin, async (req, res) => {
    try {
        if (!req.body.status)
            return res
                .status(400)
                .send({ message: "No new order status has been provided" });

        const order = await Order.findById(req.params.id).select("status");

        order.status = req.body.status;
        order.save();

        return res.send({ message: "order successfully updated" });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
});

export default orderRouter;
