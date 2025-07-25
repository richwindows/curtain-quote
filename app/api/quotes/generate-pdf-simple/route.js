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
        return `${parseFloat(item.width_m).toFixed(3)}m × ${parseFloat(item.height_m).toFixed(3)}m (${areaSquareMeters.toFixed(4)} sq.m)`;
      } else if (item.width_inch && item.height_inch) {
        const areaSquareInches = parseFloat(item.width_inch) * parseFloat(item.height_inch);
        const areaSquareMeters = areaSquareInches * 0.0254 * 0.0254;
        return `${parseFloat(item.width_inch).toFixed(3)}" × ${parseFloat(item.height_inch).toFixed(3)}" (${areaSquareMeters.toFixed(4)} sq.m)`;
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
      doc.setLineWidth(1.5);
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
     const tableWidth = 180;
     const headers = ['Location', 'Product', 'Specifications', 'Dimensions', 'Qty', 'Unit Price', 'Total Price'];
     const colWidths = [25, 30, 35, 30, 10, 25, 25];
     
     // 绘制表格外边框
     doc.setDrawColor(180, 180, 180);
     doc.setLineWidth(0.8);
     doc.rect(20, yPosition, tableWidth, 12); // 表头边框 - 减小高度
     
     // 表格头部背景
     doc.setFillColor(240, 240, 240);
     doc.rect(20, yPosition, tableWidth, 12, 'F');
     
     // 绘制表头垂直分割线
     let xPos = 20;
     for (let i = 0; i < colWidths.length - 1; i++) {
       xPos += colWidths[i];
       doc.setLineWidth(0.5);
       doc.line(xPos, yPosition, xPos, yPosition + 12);
     }
     
     // 表格头部文字
     doc.setFontSize(9);
     doc.setTextColor(60, 60, 60);
     doc.setFont(undefined, 'bold');
     
     let xPosition = 20;
     headers.forEach((header, index) => {
       const colWidth = colWidths[index];
       const textX = xPosition + colWidth / 2;
       doc.text(header, textX, yPosition + 9, { align: 'center' });
       xPosition += colWidth;
     });
     
     yPosition += 12;
     
     // 表格内容
     doc.setFont(undefined, 'normal');
     doc.setFontSize(8);
     doc.setTextColor(0, 0, 0);
     
     quoteDetails.forEach((item, index) => {
       if (yPosition > 210) {
         doc.addPage();
         yPosition = 20;
       }
       
       const rowHeight = 40;
       
       // 绘制行边框
       doc.setDrawColor(180, 180, 180);
       doc.setLineWidth(0.8);
       doc.rect(20, yPosition, tableWidth, rowHeight);
       
       // 交替行背景 - 所有行都使用白色背景
       doc.setFillColor(255, 255, 255);
       doc.rect(20, yPosition, tableWidth, rowHeight, 'F');
       
       // 绘制垂直分割线
       xPos = 20;
       for (let i = 0; i < colWidths.length - 1; i++) {
         xPos += colWidths[i];
         doc.setLineWidth(0.5);
         doc.line(xPos, yPosition, xPos, yPosition + rowHeight);
       }
       
       xPosition = 20;
       
       // Location - 居中对齐
       const locationText = item.location || '-';
       doc.setFontSize(9);
       doc.text(locationText, xPosition + colWidths[0] / 2, yPosition + rowHeight / 2, { align: 'center' });
       doc.setFontSize(8);
       xPosition += colWidths[0];
       
       // Product - 居中对齐
       doc.setFontSize(9);
       doc.text('Roller Shades', xPosition + colWidths[1] / 2, yPosition + rowHeight / 2, { align: 'center' });
       doc.setFontSize(8);
       xPosition += colWidths[1];
       
       // Specifications - 居中对齐，多行显示
       doc.setFontSize(8);
       const specs = [
         `Fabric: ${item.fabric}`,
         `Valance: ${item.valance}`,
         `Color: ${item.valance_color}`,
         `Rail: ${item.bottom_rail}`,
         `Control: ${item.control}`
       ];
       
       const totalSpecLines = Math.min(specs.length, 5);
       const specStartY = yPosition + (rowHeight - totalSpecLines * 5) / 2 + 3;
       let specY = specStartY;
       specs.forEach((spec, specIndex) => {
         if (specIndex < 5) {
           doc.setTextColor(0, 0, 0);
           doc.text(spec, xPosition + colWidths[2] / 2, specY, { align: 'center' });
           specY += 5;
         }
       });
       
     
       
       doc.setTextColor(0, 0, 0); // 恢复黑色
       doc.setFontSize(8);
       xPosition += colWidths[2];
       
       // Dimensions - 居中对齐，优化显示
       const dimensions = formatDimensions(item);
       doc.setFontSize(8);
       const dimParts = dimensions.split(' (');
       if (dimParts.length > 1) {
         doc.text(dimParts[0], xPosition + colWidths[3] / 2, yPosition + rowHeight / 2 - 3, { align: 'center' });
         doc.text(`(${dimParts[1]}`, xPosition + colWidths[3] / 2, yPosition + rowHeight / 2 + 3, { align: 'center' });
       } else {
         doc.text(dimensions, xPosition + colWidths[3] / 2, yPosition + rowHeight / 2, { align: 'center' });
       }
       doc.setFontSize(8);
       xPosition += colWidths[3];
       
       // Quantity - 居中对齐
       doc.setFontSize(9);
       doc.text(item.quantity.toString(), xPosition + colWidths[4] / 2, yPosition + rowHeight / 2, { align: 'center' });
       doc.setFontSize(8);
       xPosition += colWidths[4];
       
       // Unit Price - 居中对齐
       doc.setFontSize(9);
       doc.text(`$${parseFloat(item.unit_price || 0).toFixed(2)}`, xPosition + colWidths[5] / 2, yPosition + rowHeight / 2, { align: 'center' });
       doc.setFontSize(8);
       xPosition += colWidths[5];
       
       // Total Price - 居中对齐
       doc.setFontSize(9);
       doc.text(`$${parseFloat(item.total_price).toFixed(2)}`, xPosition + colWidths[6] / 2, yPosition + rowHeight / 2, { align: 'center' });
       doc.setFontSize(8);
       
       yPosition += rowHeight;
     });
    
    // 总计
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(33, 150, 243);
    
    // 计算Total Price列的位置
    const totalPriceColumnX = 20 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5];
    const totalPriceColumnCenter = totalPriceColumnX + colWidths[6] / 2;
    
    doc.text('Total:', totalPriceColumnCenter - 30, yPosition);
    doc.text(`$${totalAmount.toFixed(2)}`, totalPriceColumnCenter, yPosition, { align: 'center' });
    
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