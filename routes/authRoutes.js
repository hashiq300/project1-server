import { Router } from "express";
import User from '../models/User.js';
import {hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";


const authRouter = Router();



authRouter.post("/register", async (req, res) => {
    try{
        const hashedPassword = await hash(req.body.password, 10);

        const user = await User.create({
            password: hashedPassword,
            email: req.body.email,
            name: req.body.name
        })
        const userData =  {
            _id: user.id,
            email: user.email,
            name: user.name
        };
        const token = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15d"
        });

        return res.status(201).send({
            userData,
            token
        });

    }catch(err){
        res.status(500).send({message: err.message})
    }
})

authRouter.post("/login", async (req, res) => {
    try{
        const user = await User.findOne({
            email: req.body.email
        })

        if(!user) return res.status(404).send("Invalid Credentials");

        const isAuthenticated = await compare(req.body.password, user.password)

        if(!isAuthenticated) return res.status(404).send("Invalid Credentials");

        const userData =  {
            _id: user.id,
            email: user.email,
            name: user.name
        };

        const token = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15d"
        });

        return res.status(201).send({
            userData,
            token
        })

    }catch(err){
        res.status(500).send({message: err.message})
    }
})

authRouter.delete("/", async (req, res) => {
    await User.deleteMany();
    return res.send("ok")
})

export function authenticateToken(req, res, next){

    const authHeader = req.headers['authorization'];
    console.log(req.headers);
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) return res.status(400).send("Forbidden access");
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {

        if(err) return res.sendStatus(400);
        req.user = user;

    })

    next();
}

export default authRouter