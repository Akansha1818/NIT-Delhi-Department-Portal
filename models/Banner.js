import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  order: { type: Number, default: 0 },
});

export default BannerSchema;