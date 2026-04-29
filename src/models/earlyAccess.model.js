import mongoose from "mongoose";
const EarlyAccessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, // Yeh database level par error throw karega
    lowercase: true, 
    trim: true 
  },
  stage: { type: String, required: true },
}, { timestamps: true });


export default mongoose.model('EarlyAccess', EarlyAccessSchema);