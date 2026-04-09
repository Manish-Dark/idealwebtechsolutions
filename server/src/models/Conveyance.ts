import mongoose from 'mongoose';

const conveyanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    expenseType: { 
      type: String, 
      enum: ['Travel', 'Lunch', 'Dinner', 'Local Purchase', 'Other'], 
      required: true 
    },
    siteProjectName: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    
    // Conditional fields for Travel
    travelFrom: { type: String },
    travelTo: { type: String },
    transportMedium: { 
      type: String, 
      enum: ['Taxi', 'Bus', 'Metro', 'Ola', 'Rapido', 'Uber', 'Own Vehicle', 'Train', 'Other'] 
    },
    
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  },
  {
    timestamps: true,
  }
);

const Conveyance = mongoose.model('Conveyance', conveyanceSchema);

export default Conveyance;
