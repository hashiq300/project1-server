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
        };

        const token = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15d",
        });

        return res.status(201).send({
            userData: {
                name: user.name,
                email: user.email,
                userType: user.userType,
                _id: user._id,
            },
            token,
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


authRouter.get("/verify", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            "name userType email"
        );
        if (!user) res.status(400).send({ message: "Invalid Token" });

        res.send(user);
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
        };

        const token = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15d",
        });

        return res.status(201).send({
            userData: {
                name: user.name,
                email: user.email,
                userType: user.userType,
                _id: user._id,
            },
            token,
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

export function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token)
        return res
            .status(403)
            .send({ message: "Forbidden access at authToken" });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err)
            return res.status(403).send({ message: "Cannot verify token" });
        req.user = user;
    });

    next();
}

export async function checkAdmin(req, res, next) {
    try {
        const user = await User.findById(req.user._id).select("userType");
        if (user.userType === "ADMIN") {
            next();
        } else {
            return res
                .status(403)
                .send({ message: "Forbidden Access at admin" });
        }
    } catch (err) {
        res.status(500).send({ message: `${err.message} at admin check` });
    }
}

export default authRouter;
