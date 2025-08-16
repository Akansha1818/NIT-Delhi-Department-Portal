// models/cse/Event.js
import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, default: 'Live' },
  category: { type: String, required: true },
  coordinators: { type: [String], required: true },
  startdate: { type: Date, required: true },
  lasttdate: { type: Date },
  venue: { type: String, required: true },
  organizedBy: { type: String},
  description: { type: String, required: true },
  bannerId: mongoose.Types.ObjectId,
  brochureId: mongoose.Types.ObjectId,
  eventImageIds: [mongoose.Types.ObjectId],
}, { timestamps: true });

export default EventSchema;
