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
                    return Number.isInteger(num) && num >= 0;
                },
                message: "{VALUE} is not positive integer",
            },
        },
        image: {
            type: String,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            validate: {
                validator: (num) => {
                    return Number.isInteger(num) && num >= 0;
                },
                message: "{VALUE} is not positive integer",
            },
        },
    },
    {
        timestamps: true,
    }
);

// function isPositive(num) {
//     return num >= 0;
// }

export default model("Product", productSchema);
