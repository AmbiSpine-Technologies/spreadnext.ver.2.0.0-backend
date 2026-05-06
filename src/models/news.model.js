import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true }, 
  category: { 
    type: String, 
    enum: ['Announcements', 'Product'], 
    default: 'Announcements' 
  },
  author: { type: String, default: 'Spreadnext Team' },
  featuredImage: { 
    url: { type: String, required: true },
    key: { type: String } 
  }, 
  excerpt: { type: String }, 
  content: { type: String, required: true }, 
  isFeatured: { type: Boolean, default: false }, 
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  
},
{
    timestamps: true,
  }
);

export default mongoose.model("News", NewsSchema);