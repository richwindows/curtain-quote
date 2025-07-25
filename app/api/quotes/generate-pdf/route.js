import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

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

    // 生成HTML内容
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>报价单 #${quoteNumber}</title>
        <style>
            body {
                font-family: 'Microsoft YaHei', Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
                line-height: 1.6;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
                font-size: 28px;
            }
            .quote-details {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 10px;
            }
            .quote-details p {
                margin: 0;
                font-size: 14px;
                color: #666;
            }
            .customer-info {
                margin: 20px 0;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 5px;
                border-left: 4px solid #007bff;
            }
            .customer-info p {
                margin: 5px 0;
                font-size: 14px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 12px;
            }
            th, td {
                border: 1px solid #dee2e6;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #e9ecef;
                font-weight: bold;
                color: #495057;
            }
            .total-row {
                background-color: #f8f9fa;
                font-weight: bold;
            }
            .specs {
                font-size: 10px;
                line-height: 1.4;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Quote</h1>
            <div class="quote-details">
                <p>Quote #${quoteNumber}</p>
                <p>${new Date().toLocaleDateString('en-US')}</p>
            </div>
        </div>

        ${hasCustomerInfo ? `
        <div class="customer-info">
            ${customerInfo.customer_name ? `<p><strong>Customer:</strong> ${customerInfo.customer_name}</p>` : ''}
            ${customerInfo.phone ? `<p><strong>Phone:</strong> ${customerInfo.phone}</p>` : ''}
            ${customerInfo.email ? `<p><strong>Email:</strong> ${customerInfo.email}</p>` : ''}
            ${customerInfo.address ? `<p><strong>Address:</strong> ${customerInfo.address}</p>` : ''}
        </div>` : ''}

        <table>
            <thead>
                <tr>
                    <th style="width: 8%;">Location</th>
                    <th style="width: 12%;">Product</th>
                    <th style="width: 25%;">Specifications</th>
                    <th style="width: 15%;">Dimensions</th>
                    <th style="width: 8%;">Quantity</th>
                    <th style="width: 12%;">Unit Price</th>
                    <th style="width: 12%;">Total Price</th>
                </tr>
            </thead>
            <tbody>
                ${quoteDetails.map(item => `
                    <tr>
                        <td>${item.location || '-'}</td>
                        <td>${item.product}</td>
                        <td class="specs">
                            <div>Fabric: ${item.fabric}</div>
                            <div>Valance: ${item.valance}</div>
                            <div>Color: ${item.valance_color}</div>
                            <div>Rail: ${item.bottom_rail}</div>
                            <div>Control: ${item.control}</div>
                            ${item.fabric_price ? `<div style="color: #28a745;">Fabric Price: $${parseFloat(item.fabric_price).toFixed(2)}</div>` : ''}
                            ${item.motor_price ? `<div style="color: #007bff;">Motor: $${parseFloat(item.motor_price).toFixed(2)}</div>` : ''}
                        </td>
                        <td>${formatDimensions(item)}</td>
                        <td>${item.quantity}</td>
                        <td>$${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                        <td>$${parseFloat(item.total_price).toFixed(2)}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td colspan="6" style="text-align: right; font-weight: bold;">Total:</td>
                    <td style="font-weight: bold; color: #007bff;">$${totalAmount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    </body>
    </html>
    `;

    // 启动Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // 生成PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true
    });

    await browser.close();

    // 返回PDF文件
    const filename = `Quote_${quoteNumber}.pdf`;
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('PDF生成错误:', error);
    return NextResponse.json(
      { error: 'PDF生成失败' },
      { status: 500 }
    );
  }
}