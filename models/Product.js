import { Schema, model } from "mongoose";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
            validate: {
                validator: (num) => {
                    return num >= 0;
                },
                message: "{VALUE} is not positive",
            },
        },
        image: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default model("Product", productSchema);
