import mongoose from "mongoose";

const DCSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    department: {
        type: String,
        required: true,
        unique: true,
    }
}, {
    timestamps: true,
});

export default DCSchema;