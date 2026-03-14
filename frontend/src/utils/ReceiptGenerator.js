import jsPDF from 'jspdf';

export const generateReceipt = (sale, pharmacy) => {
    const doc = new jsPDF({
        unit: 'mm',
        format: [80, 200] // 80mm thermal paper
    });

    const pageWidth = doc.internal.pageSize.width;
    const pharmacyName = pharmacy?.name || 'SHARMA MEDICAL STORE';
    const pharmacyTagline = 'Your Trusted Healthcare Partner';
    
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(pharmacyName.toUpperCase(), pageWidth / 2, 10, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(pharmacyTagline, pageWidth / 2, 14, { align: 'center' });
    
    doc.line(5, 17, pageWidth - 5, 17); // Separator
    
    // Invoice Info
    doc.setFont('courier', 'normal'); // Use courier for a clean POS look
    doc.setFontSize(8);
    let y = 22;
    doc.text(`DATE: ${new Date(sale.createdAt || Date.now()).toLocaleString()}`, 5, y);
    y += 4;
    doc.text(`INV #: ${sale._id?.slice(-8).toUpperCase() || 'N/A'}`, 5, y);
    y += 4;
    doc.text(`CUST: ${sale.customerName?.toUpperCase() || 'WALKING CUSTOMER'}`, 5, y);
    if (sale.customerPhone) {
        y += 4;
        doc.text(`PH: ${sale.customerPhone}`, 5, y);
    }
    y += 4;
    doc.text(`MODE: ${sale.paymentMethod?.toUpperCase() || 'CASH'}`, 5, y);
    
    y += 3;
    doc.line(5, y, pageWidth - 5, y);
    y += 5;
    
    // Items Table Header
    doc.setFont('courier', 'bold');
    doc.text('ITEM', 5, y);
    doc.text('QTY', 40, y);
    doc.text('PRICE', 52, y);
    doc.text('TOTAL', 70, y, { align: 'right' });
    
    y += 2;
    doc.line(5, y, pageWidth - 5, y);
    y += 5;
    
    // Items
    doc.setFont('courier', 'normal');
    sale.items.forEach(item => {
        let nameStr = item.manual ? `${item.name} (M)` : item.name;
        const name = nameStr.length > 20 ? nameStr.substring(0, 18) + '..' : nameStr;
        doc.text(name.toUpperCase(), 5, y);
        doc.text(item.quantity.toString(), 40, y);
        doc.text(item.price.toFixed(2), 52, y);
        doc.text((item.price * item.quantity).toFixed(2), 70, y, { align: 'right' });
        y += 4;
        
        if (y > doc.internal.pageSize.height - 30) {
            doc.addPage();
            y = 10;
        }
    });
    
    y += 1;
    doc.line(5, y, pageWidth - 5, y);
    y += 6;
    
    // Summary
    doc.setFont('courier', 'bold');
    doc.text('SUBTOTAL:', 5, y);
    doc.text(`Rs. ${sale.totalAmount?.toFixed(2) || '0.00'}`, 70, y, { align: 'right' });
    
    if (sale.totalDiscount > 0) {
        y += 5;
        doc.text('DISCOUNT:', 5, y);
        doc.text(`-Rs. ${sale.totalDiscount?.toFixed(2)}`, 70, y, { align: 'right' });
    }
    
    y += 5;
    doc.text('GST (12%):', 5, y);
    doc.text(`Rs. ${sale.tax?.toFixed(2) || '0.00'}`, 70, y, { align: 'right' });

    y += 6;
    doc.setFontSize(10);
    doc.text('GRAND TOTAL:', 5, y);
    doc.text(`Rs. ${sale.grandTotal?.toLocaleString() || '0.00'}`, 70, y, { align: 'right' });
    
    // Footer
    y += 15;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('Thank you for your visit!', pageWidth / 2, y, { align: 'center' });
    
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6); // Very small font
    doc.setTextColor(128, 128, 128); // Gray color
    doc.text('Powered by PharmFlow', pageWidth / 2, y, { align: 'center' });

    const fileName = `Receipt_${sale._id?.slice(-8) || Date.now()}.pdf`;
    doc.save(fileName);
    return fileName;
};
