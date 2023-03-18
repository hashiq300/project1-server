import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        userType: {
            type: String,
            enum: ["NORMAL", "ADMIN"],
            default: "NORMAL",
        },
    },
    {
        timestamps: true,
    }
);

export default model("User", userSchema);
