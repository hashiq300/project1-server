import { Router } from "express";
import User from "../models/User.js";
import { authenticateToken, checkAdmin } from "./authRoutes.js";
import { compare } from "bcrypt";

const userRouter = Router();

userRouter.get("/", authenticateToken, checkAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .where("_id")
            .ne(req.user._id);
        return res.send(users);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

userRouter.patch("/", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (req.body.name) {
            user.name = req.body.name;
            req.user.name = req.body.name;
        }
        await user.save();

        res.send({
            name: user.name,
            email: user.email,
            userType: user.userType,
            _id: user._id,
        });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

userRouter.delete("/:id", authenticateToken, checkAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.send({ message: "successfully deleted user" });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

userRouter.delete("/", authenticateToken, async (req, res) => {
    try {
        if (!req.body.password)
            return res
                .status(400)
                .send({ message: "No password has been passed" });

        const user = await User.findById(req.user._id).select("password");
        const isAuth = await compare(req.body.password, user.password);

        if (!isAuth)
            return res.status(403).send({ message: "Invalid password" });

        await User.findByIdAndDelete(req.user._id);
        res.send({ message: "sucessfully deleted user" });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

export default userRouter;