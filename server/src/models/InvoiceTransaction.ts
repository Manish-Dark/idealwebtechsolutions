import mongoose from 'mongoose';

const invoiceTransactionItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hsnSac: { type: String, default: '-' },
    qty: { type: Number, required: true },
    rate: { type: Number, required: true },
    taxableValue: { type: Number, required: true },
    igstPercent: { type: Number, required: true },
    igstAmount: { type: Number, required: true },
    total: { type: Number, required: true }
  },
  { _id: false }
);

const invoiceTransactionSchema = new mongoose.Schema(
  {
    sourceInvoiceId: { type: String, required: true, unique: true, immutable: true },
    transactionType: { type: String, required: true, default: 'INVOICE_GENERATED', immutable: true },
    invoiceNo: { type: String, required: true, immutable: true },
    invoiceDate: { type: Date, required: true, immutable: true },
    customerName: { type: String, required: true, immutable: true },
    customerAddress: { type: String, required: true, immutable: true },
    customerPhone: { type: String, required: true, immutable: true },
    customerGSTIN: { type: String, immutable: true },
    placeOfSupply: { type: String, required: true, immutable: true },
    items: { type: [invoiceTransactionItemSchema], required: true, immutable: true },
    totalQty: { type: Number, required: true, immutable: true },
    totalTaxableValue: { type: Number, required: true, immutable: true },
    totalIgst: { type: Number, required: true, immutable: true },
    grandTotal: { type: Number, required: true, immutable: true },
    totalInWords: { type: String, required: true, immutable: true },
    generatedAt: { type: Date, default: Date.now, immutable: true }
  },
  { timestamps: true, collection: 'invoices_transactions' }
);

const InvoiceTransaction = mongoose.model('InvoiceTransaction', invoiceTransactionSchema);

export default InvoiceTransaction;
