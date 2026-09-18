export const toInvoiceTransactionData = (invoice: any) => {
  const source = typeof invoice.toObject === 'function' ? invoice.toObject() : invoice;

  return {
    sourceInvoiceId: String(source._id),
    transactionType: 'INVOICE_GENERATED',
    invoiceNo: source.invoiceNo,
    invoiceDate: source.invoiceDate,
    customerName: source.customerName,
    customerAddress: source.customerAddress,
    customerPhone: source.customerPhone,
    customerGSTIN: source.customerGSTIN,
    placeOfSupply: source.placeOfSupply,
    items: (source.items || []).map((item: any) => ({
      name: item.name,
      hsnSac: item.hsnSac || '-',
      qty: Number(item.qty) || 0,
      rate: Number(item.rate) || 0,
      taxableValue: Number(item.taxableValue) || 0,
      igstPercent: Number(item.igstPercent) || 0,
      igstAmount: Number(item.igstAmount) || 0,
      total: Number(item.total) || 0,
    })),
    totalQty: Number(source.totalQty) || 0,
    totalTaxableValue: Number(source.totalTaxableValue) || 0,
    totalIgst: Number(source.totalIgst) || 0,
    grandTotal: Number(source.grandTotal) || 0,
    totalInWords: source.totalInWords,
    generatedAt: source.createdAt || new Date(),
  };
};
