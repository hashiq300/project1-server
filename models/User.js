import { Schema, model } from "mongoose";


const userSchema = new Schema({
    name:{
        type: String,
        required: true,   
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        pincode: {
            type: String,
        },
        landmark: {
            type: String,
        },
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        immutable: true
    },
    userType: {
        type: String,
        enum : ['NORMAL','ADMIN'],
        default: 'NORMAL'
    }
})


export default model("User", userSchema);