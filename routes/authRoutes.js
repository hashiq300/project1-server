import { Router } from "express";
import User from "../models/User.js";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
    try {
        const hashedPassword = await hash(req.body.password, 10);

        const user = await User.create({
            password: hashedPassword,
            email: req.body.email,
            name: req.body.name,
        });

        const userData = {
            _id: user._id,
            email: user.email,
            name: user.name,
            userType: user.userType,
        };

        const token = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15d",
        });

        return res.status(201).send({
            userData,
            token,
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

authRouter.post("/login", async (req, res) => {
    // console.log(req.body)
    try {
        const user = await User.findOne({
            email: req.body.email,
        });
        if (!user)
        return res.status(404).send({ message: "Invalid Credentials" });
        
        const isAuthenticated = await compare(req.body.password, user.password);
        

        if (!isAuthenticated)
            return res.status(404).send({ message: "Invalid Credentials" });

        const userData = {
            _id: user._id,
            email: user.email,
            name: user.name,
            userType: user.userType,
        };

        const token = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15d",
        });

        console.log(userData,token)

        return res.status(201).json({
            userData,
            token,
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

authRouter.delete("/", async (req, res) => {
    await User.deleteMany();
    return res.send("ok");
});

export function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(403).send({ message: "Forbidden access" });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err)
            return res.status(403).send({ message: "Cannot verify token" });
        req.user = user;
    });

    next();
}

export function checkAdmin(req, res, next) {
    try {
        if (req.user.userType === "ADMIN") {
            next();
        } else {
            return res.status(403).send({ message: "Forbidden Access" });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

export default authRouter;
