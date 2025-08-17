// import mongoose from 'mongoose';

// const GallerySchema = new mongoose.Schema({
//   eventName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   eventDate: {
//     type: String,
//     required: true
//   },
//   place: {
//     type: String,
//     trim: true
//   },
//   time: {
//     type: String,
//     trim: true
//   },
//   url: {
//     type: String,
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   }
// }, {
//   timestamps: true
// });

// // Index for better query performance
// GallerySchema.index({ eventDate: -1 });
// GallerySchema.index({ eventName: 1 });

// export default mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);




// models/Gallery.js
import mongoose from 'mongoose';

const GallerySchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  eventDate: {
    type: String,
    required: true
  },
  place: {
    type: String,
    trim: true
  },
  time: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true,
    index: true
  },
  order: {
    type: Number,
    default: 0,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
GallerySchema.index({ eventDate: -1 });
GallerySchema.index({ eventName: 1 });
GallerySchema.index({ order: 1, createdAt: 1 });
GallerySchema.index({ user: 1, order: 1 });

export default mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);