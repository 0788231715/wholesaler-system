const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  // Generate invoice PDF
  static generateInvoice(invoice, order, retailer) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        this.addHeader(doc);
        
        // Invoice Info
        this.addInvoiceInfo(doc, invoice);
        
        // Retailer Info
        this.addRetailerInfo(doc, retailer);
        
        // Items Table
        this.addItemsTable(doc, invoice.items);
        
        // Totals
        this.addTotals(doc, invoice);
        
        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  static addHeader(doc) {
    doc.fillColor('#2c3e50')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('WHOLESALER SYSTEM', 50, 50);
    
    doc.fillColor('#666666')
       .fontSize(10)
       .font('Helvetica')
       .text('INVOICE', 50, 75);
    
    // Add a line
    doc.moveTo(50, 85)
       .lineTo(550, 85)
       .strokeColor('#cccccc')
       .lineWidth(1)
       .stroke();
  }

  static addInvoiceInfo(doc, invoice) {
    doc.fillColor('#333333')
       .fontSize(10)
       .font('Helvetica')
       .text('Invoice Details:', 50, 110);
    
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 125);
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 50, 140);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 155);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 50, 170);
  }

  static addRetailerInfo(doc, retailer) {
    const retailerX = 300;
    
    doc.fillColor('#333333')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Bill To:', retailerX, 110);
    
    doc.font('Helvetica')
       .text(retailer.name, retailerX, 125);
    
    if (retailer.company) {
      doc.text(retailer.company, retailerX, 140);
    }
    
    if (retailer.address) {
      const addressLines = [];
      if (retailer.address.street) addressLines.push(retailer.address.street);
      if (retailer.address.city) addressLines.push(retailer.address.city);
      if (retailer.address.state || retailer.address.zipCode) {
        addressLines.push(`${retailer.address.state || ''} ${retailer.address.zipCode || ''}`.trim());
      }
      
      addressLines.forEach((line, index) => {
        doc.text(line, retailerX, 155 + (index * 15));
      });
    }
  }

  static addItemsTable(doc, items) {
    let yPosition = 220;
    
    // Table Header
    doc.fillColor('#ffffff')
       .rect(50, yPosition, 500, 20)
       .fill('#2c3e50');
    
    doc.fillColor('#ffffff')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('Description', 55, yPosition + 5)
       .text('Qty', 350, yPosition + 5)
       .text('Unit Price', 400, yPosition + 5)
       .text('Total', 470, yPosition + 5);
    
    yPosition += 25;

    // Table Rows
    items.forEach((item, index) => {
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
      doc.fillColor(bgColor)
         .rect(50, yPosition, 500, 20)
         .fill();
      
      doc.fillColor('#333333')
         .fontSize(9)
         .font('Helvetica')
         .text(item.productName, 55, yPosition + 5, { width: 280 })
         .text(item.quantity.toString(), 350, yPosition + 5)
         .text(`$${item.unitPrice.toFixed(2)}`, 400, yPosition + 5)
         .text(`$${item.total.toFixed(2)}`, 470, yPosition + 5);
      
      yPosition += 20;
    });

    return yPosition;
  }

  static addTotals(doc, invoice) {
    const startY = 500;
    
    doc.fillColor('#333333')
       .fontSize(10)
       .font('Helvetica')
       .text('Subtotal:', 400, startY)
       .text(`$${invoice.subtotal.toFixed(2)}`, 470, startY)
       
       .text(`Tax (${invoice.taxRate}%):`, 400, startY + 15)
       .text(`$${invoice.taxAmount.toFixed(2)}`, 470, startY + 15)
       
       .font('Helvetica-Bold')
       .text('Total:', 400, startY + 35)
       .text(`$${invoice.totalAmount.toFixed(2)}`, 470, startY + 35);
  }

  static addFooter(doc) {
    doc.fillColor('#666666')
       .fontSize(8)
       .font('Helvetica')
       .text('Thank you for your business!', 50, 700)
       .text('Wholesaler System - Your trusted wholesale partner', 50, 715)
       .text('If you have any questions about this invoice, please contact our support team.', 50, 730);
  }

  // Generate sales report PDF
  static generateSalesReport(data, startDate, endDate) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(16).font('Helvetica-Bold').text('SALES REPORT', 50, 50);
        doc.fontSize(10).font('Helvetica')
           .text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 50, 75);

        // Summary
        let yPosition = 120;
        data.forEach((item, index) => {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(12)
             .text(`Date: ${item._id.day}/${item._id.month}/${item._id.year}`, 50, yPosition)
             .text(`Total Sales: $${item.totalSales.toFixed(2)}`, 200, yPosition)
             .text(`Orders: ${item.orderCount}`, 350, yPosition)
             .text(`Avg Order: $${item.averageOrderValue.toFixed(2)}`, 450, yPosition);
          
          yPosition += 20;
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGenerator;