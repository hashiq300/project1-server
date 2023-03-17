import express from "express"
import mongoose from "mongoose";

const app = express();

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on("error", (err) => {
    console.log(err)
})
db.on("open", () => {
    console.log("mongodb connected")
})



app.use(express.json())

app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server listening on port ${process.env.PORT ?? 3000}`)
})