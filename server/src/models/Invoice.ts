import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hsnSac: { type: String, default: '-' },
  qty: { type: Number, required: true },
  rate: { type: Number, required: true },
  taxableValue: { type: Number, required: true },
  igstPercent: { type: Number, required: true },
  igstAmount: { type: Number, required: true },
  total: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, required: true },
    challanNo: { type: String },
    challanDate: { type: Date },
    eWayBillNo: { type: String },
    transport: { type: String },
    transportId: { type: String },

    // Customer Details
    customerName: { type: String, required: true },
    customerAddress: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerGSTIN: { type: String },
    placeOfSupply: { type: String, required: true },

    // Items
    items: [invoiceItemSchema],

    // Summary
    totalQty: { type: Number, required: true },
    totalTaxableValue: { type: Number, required: true },
    totalIgst: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    totalInWords: { type: String, required: true }
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
