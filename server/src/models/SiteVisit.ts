import mongoose from 'mongoose';

const siteVisitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    date: { type: Date, required: true },
    contactPersonType: { 
      type: String, 
      enum: ['Selection', 'Manual'], 
      required: true 
    },
    contactPersonName: { type: String, required: true },
    contactPersonMobile: { type: String, required: true },
    contactPersonDesignation: { type: String, required: true },
    workDescription: { type: String, required: true },
    nextAction: { type: String }, // Follow-up (Optional)
    status: { type: String, enum: ['Completed', 'Pending'], default: 'Completed' },
  },
  {
    timestamps: true,
  }
);

const SiteVisit = mongoose.model('SiteVisit', siteVisitSchema);

export default SiteVisit;
