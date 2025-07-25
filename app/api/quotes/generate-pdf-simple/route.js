import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';

export async function POST(request) {
  try {
    const { quoteNumber, quoteDetails } = await request.json();

    if (!quoteNumber || !quoteDetails || quoteDetails.length === 0) {
      return NextResponse.json(
        { error: '缺少必要的报价单数据' },
        { status: 400 }
      );
    }

    // 获取客户信息（从第一条记录中获取）
    const customerInfo = quoteDetails[0] || {};
    const hasCustomerInfo = customerInfo.customer_name || customerInfo.phone || customerInfo.email || customerInfo.address;

    // 计算总金额
    const totalAmount = quoteDetails.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

    // 格式化尺寸显示
    const formatDimensions = (item) => {
      if (item.width_m && item.height_m) {
        const areaSquareMeters = parseFloat(item.width_m) * parseFloat(item.height_m);
        return `${parseFloat(item.width_m).toFixed(3)}m × ${parseFloat(item.height_m).toFixed(3)}m (${areaSquareMeters.toFixed(4)} ㎡)`;
      } else if (item.width_inch && item.height_inch) {
        const areaSquareInches = parseFloat(item.width_inch) * parseFloat(item.height_inch);
        const areaSquareMeters = areaSquareInches * 0.0254 * 0.0254;
        return `${parseFloat(item.width_inch).toFixed(3)}" × ${parseFloat(item.height_inch).toFixed(3)}" (${areaSquareMeters.toFixed(4)} ㎡)`;
      } else {
        return 'N/A';
      }
    };

    // 创建PDF文档
    const doc = new jsPDF();
    
    // 设置标题
    doc.setFontSize(28);
    doc.setTextColor(33, 150, 243); // 蓝色
    doc.text('Quote', 105, 30, { align: 'center' });
    
    // 报价单号和日期
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Quote #${quoteNumber}`, 20, 50);
    doc.text(new Date().toLocaleDateString('en-US'), 160, 50);
    
    // 标题下方分割线
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(1.5);
    doc.line(20, 55, 190, 55);
    
    let yPosition = 70;
    
    // 客户信息
    if (hasCustomerInfo) {
      // 客户信息左侧蓝色竖线
      doc.setDrawColor(33, 150, 243);
      doc.setLineWidth(3);
      doc.line(20, yPosition, 20, yPosition + 15);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      if (customerInfo.customer_name) {
        doc.text(`Customer: ${customerInfo.customer_name}`, 25, yPosition + 5);
      }
      yPosition += 25;
    }
    
    // 表格开始
    const tableStartY = yPosition;
    const tableWidth = 170;
    const headers = ['Location', 'Product', 'Specifications', 'Dimensions', 'Quantity', 'Unit Price', 'Total Price'];
    const colWidths = [20, 22, 45, 25, 18, 20, 20];
    
    // 表格头部背景
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPosition, tableWidth, 12, 'F');
    
    // 表格头部文字
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.setFont(undefined, 'bold');
    
    let xPosition = 20;
    headers.forEach((header, index) => {
      doc.text(header, xPosition + 2, yPosition + 8);
      xPosition += colWidths[index];
    });
    
    yPosition += 12;
    
    // 表格内容
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    
    quoteDetails.forEach((item, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      const rowHeight = 25;
      
      // 交替行背景
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPosition, tableWidth, rowHeight, 'F');
      }
      
      xPosition = 20;
      
      // Location
      doc.text(item.location || '-', xPosition + 2, yPosition + 8);
      xPosition += colWidths[0];
      
      // Product
      doc.text('Roller Shades', xPosition + 2, yPosition + 8);
      xPosition += colWidths[1];
      
      // Specifications - 多行显示
      const specs = [
        `Fabric: ${item.fabric}`,
        `Valance: ${item.valance}`,
        `Color: ${item.valance_color}`,
        `Rail: ${item.bottom_rail}`,
        `Control: ${item.control}`
      ];
      
      if (item.fabric_price) {
        specs.push(`Fabric Price: $${parseFloat(item.fabric_price).toFixed(2)}`);
      }
      
      specs.forEach((spec, specIndex) => {
        if (specIndex < 3) { // 只显示前3行主要信息
          doc.text(spec, xPosition + 2, yPosition + 6 + (specIndex * 4));
        }
      });
      xPosition += colWidths[2];
      
      // Dimensions
      const dimensions = formatDimensions(item);
      const dimLines = doc.splitTextToSize(dimensions, colWidths[3] - 4);
      dimLines.forEach((line, lineIndex) => {
        doc.text(line, xPosition + 2, yPosition + 8 + (lineIndex * 4));
      });
      xPosition += colWidths[3];
      
      // Quantity
      doc.text(item.quantity.toString(), xPosition + 8, yPosition + 12);
      xPosition += colWidths[4];
      
      // Unit Price
      doc.text(`$${parseFloat(item.unit_price || 0).toFixed(2)}`, xPosition + 2, yPosition + 12);
      xPosition += colWidths[5];
      
      // Total Price
      doc.text(`$${parseFloat(item.total_price).toFixed(2)}`, xPosition + 2, yPosition + 12);
      
      yPosition += rowHeight;
      
      // 行分割线
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(20, yPosition, 190, yPosition);
    });
    
    // 总计
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(33, 150, 243);
    doc.text('Total:', 140, yPosition);
    doc.text(`$${totalAmount.toFixed(2)}`, 160, yPosition);
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quoteNumber}.pdf"`
      }
    });

  } catch (error) {
    console.error('PDF生成错误:', error);
    return NextResponse.json(
      { error: 'PDF生成失败: ' + error.message },
      { status: 500 }
    );
  }
}