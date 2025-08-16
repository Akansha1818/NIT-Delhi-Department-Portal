import mongoose from 'mongoose';

const ProgramSchema = new mongoose.Schema({
    category: { type: String, required: true },
    title: { type: String, required: true },
    no_of_students: {'boys': { type: Number, required: true }, 'girls': { type: Number, required: true }},
    no_of_seats: {'josaa': { type: Number, required: true }, 'csab': { type: Number, required: true }, 'dasa': { type: Number, required: true }},
    scheme: [{'title': { type: String, required: true }, 'url': { type: String, required: true }}],
    PSO: { type: String },
    PEO: { type: String },
    PO: { type: String },
}, { timestamps: true });

export default ProgramSchema;