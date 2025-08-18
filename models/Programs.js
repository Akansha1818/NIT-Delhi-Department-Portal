// import mongoose from 'mongoose';

// const ProgramSchema = new mongoose.Schema({
//     category: { type: String, required: true },
//     title: { type: String, required: true },
//     no_of_students: {'Male': { type: Number, required: true }, 'Female': { type: Number, required: true }},
//     no_of_seats: {'josaa': { type: Number, required: true }, 'csab': { type: Number, required: true }, 'dasa': { type: Number, required: true }},
//     scheme: [{'title': { type: String, required: true }, 'url': { type: String, required: true }}],
//     PSO: { type: String },
//     PEO: { type: String },
//     PO: { type: String },
// }, { timestamps: true });

// export default ProgramSchema;

import mongoose from 'mongoose';

const ProgramSchema = new mongoose.Schema({
    category: { type: String, required: true },
    title: { type: String, required: true },
    no_of_students: {
        'Male': { type: Number, required: true }, 
        'Female': { type: Number, required: true }
    },
    no_of_seats: {
        'josaa': { type: Number, required: true }, 
        'csab': { type: Number, required: true }, 
        'dasa': { type: Number, required: true }
    },
    scheme: [{
        'title': { type: String, required: true }, 
        'filename': { type: String, required: true }, // Store original filename
        'filepath': { type: String, required: true }, // Store file path on server
        'uploadDate': { type: Date, default: Date.now }
    }],
    PSO: { type: String },
    PEO: { type: String },
    PO: { type: String },
}, { timestamps: true });

export default ProgramSchema;