import express from "express";
import mongoose from "mongoose";
import authRouter from "./routes/authRoutes.js";
import productRouter from "./routes/productRoutes.js";
import cors from "cors";

const app = express();

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on("error", (err) => {
    console.log(err);
});
db.on("open", () => {
    console.log("mongodb connected");
});

app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use("/auth", authRouter);
app.use("/product", productRouter);

app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server listening on port ${process.env.PORT ?? 3000}`);
});
