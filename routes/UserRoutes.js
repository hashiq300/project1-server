import { Router } from "express";
import User from "../models/User.js";
import { authenticateToken, checkAdmin } from "./authRoutes.js";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

const userRouter = Router();

// for getting all user details for admin
userRouter.get("/", authenticateToken, checkAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .where("_id")
            .ne(req.user._id);
        res.send(users);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// for updating user detail for user
userRouter.patch("/", authenticateToken, async (req, res) => {
    try {
        if (!req.body.password)
            return res
                .status(400)
                .send({ message: "No password has been passed" });

        const user = await User.findById(req.user._id);

        if (req.body.name) {
            user.name = req.body.name;
            req.user.name = req.body.name;
        }

        const isAuth = await compare(req.body.password, user.password);

        if (!isAuth)
            return res.status(403).send({ message: "Invalid password" });

        await user.save();
        const token = jwt.sign(req.user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15d",
        });

        res.send({
            user: req.user,
            token,
        });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});


// for delete user by admin
userRouter.delete("/:id", authenticateToken, checkAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.send({ message: "successfully deleted user" });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// delete user by themselves 
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
