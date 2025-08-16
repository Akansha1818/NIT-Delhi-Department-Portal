import mongoose from 'mongoose';

const LabSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coordinators: { type: [String], required: true },
  technical_staff: { type: [String], required: true },
  address: { type: String, required: true },
  specialization: { type: String, required: true },
  webpageURL: { type: String },
  description: { type: String, required: true },
  objectives: { type: [String], required: true },
  capacity: { type: Number, required: true },
  hardware_details: [{
    component: { type: String, required: true },
    specifications: { type: [String], required: true },
    quantity: { type: Number, required: true }
  }],
  software_details: [{
    component: { type: String },
    specifications: { type: [String] },
    quantity: { type: Number }
  }],
  labImageIds: [mongoose.Types.ObjectId],
}, { timestamps: true });

export default LabSchema;
