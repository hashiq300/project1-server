import { Schema, model } from "mongoose";

const cartSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        inventory: [
            {
                product_id: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                count: {
                    type: Number,
                    default: 1,
                    validate: {
                        validator: (num) => {
                            return Number.isInteger(num) && num >= 1;
                        },
                        message: "{VALUE} is not integer greater than 0",
                    },
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default model("Cart", cartSchema);
