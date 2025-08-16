import mongoose from 'mongoose';

const AboutSchema = new mongoose.Schema({
  hod_name: { type: String, required: true },
  hod_message: { type: String, required: true },
  hod_imageId: mongoose.Types.ObjectId,
}, { timestamps: true });

export default AboutSchema;
