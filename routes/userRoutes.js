import { Router } from "express";
import User from "../models/User.js";
import Address from "../models/Address.js";
import { authenticateToken, checkAdmin } from "./authRoutes.js";
import { compare } from "bcrypt";

const userRouter = Router();

// for getting all user details for admin
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

userRouter.get("/address", authenticateToken, async (req, res) => {
  console.log(req);
  try {
    const address = await Address.findOne({
      user_id: req.user._id,
    });

    if (!address)
      return res
        .status(404)
        .send({ message: "Address not found", addressFind: false });

    res.send({address,addressFind:true});
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

userRouter.post("/address", authenticateToken, async (req, res) => {
  const { city, landMark, pincode, country, state } = req.body;
  console.log(req.user._id);
  try {
    let address = await Address.findOne({
      user_id: req.user._id,
    });

    if (!address) {
      try {
        const address = await Address.create({
          user_id: req.user._id,
          landmark:landMark,
          city,
          pincode,
          country,
          state,
        });
        console.log("ll", address);
        res.status(200).json(address);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }

    // if (!address) {
    //   address = await Address.create({
    //     user_id: req.user._id,
    //     country: req.body.country,
    //     city: req.body.city,
    //     landmark: req.body.landmark,
    //     state: req.body.state,
    //     pincode: req.body.pincode,
    //   });

    //   res.statusCode = 201;
    // } else {
    //   address.country = req.body.country;
    //   address.state = req.body.state;
    //   address.landmark = req.body.landmark;
    //   address.city = req.body.city;
    //   address.save();
    //   console.log(address)
    //   res.statusCode = 200;
    // }
    // res.send(address);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// for updating user detail for user
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

// for delete user by admin
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
      return res.status(400).send({ message: "No password has been passed" });

    const user = await User.findById(req.user._id).select("password");
    const isAuth = await compare(req.body.password, user.password);

    if (!isAuth) return res.status(403).send({ message: "Invalid password" });

    await User.findByIdAndDelete(req.user._id);
    res.send({ message: "sucessfully deleted user" });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

export default userRouter;
