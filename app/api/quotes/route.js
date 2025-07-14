import { NextResponse } from 'next/server';
import { saveQuote, getQuotesByPage, deleteQuote } from '../../../lib/database';

export async function POST(request) {
  try {
    const quoteData = await request.json();
    
    // 检查是否有items数组（新的多item模式）
    if (quoteData.items && Array.isArray(quoteData.items)) {
      // 多item模式 - 为所有items生成相同的quote_number
      const results = [];
      let quoteNumber = null;
      
      for (const item of quoteData.items) {
        const fullItemData = {
          customer_name: quoteData.customer_name || '',
          phone: quoteData.phone || '',
          email: quoteData.email || '',
          address: quoteData.address || '',
          quote_number: quoteNumber, // 使用相同的quote_number
          ...item
        };
        
        const result = await saveQuote(fullItemData);
        if (!quoteNumber) {
          quoteNumber = result.quoteNumber; // 第一个item时设置quoteNumber
        }
        results.push(result.id);
      }
      
      const totalPrice = quoteData.items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return NextResponse.json({
        success: true,
        quoteNumber: quoteNumber,
        totalPrice: totalPrice,
        itemCount: results.length
      });
    } else {
      // 单item模式（向后兼容）
      const requiredFields = ['width_inch', 'height_inch', 'product', 'valance', 'valance_color', 'bottom_rail', 'control', 'fabric', 'quantity'];
      
      for (const field of requiredFields) {
        if (!quoteData[field]) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      }

      const result = await saveQuote(quoteData);
      const totalPrice = quoteData.unitPrice * parseInt(quoteData.quantity);
      
      return NextResponse.json({
        success: true,
        quoteNumber: result.quoteNumber,
        totalPrice: totalPrice
      });
    }
    
  } catch (error) {
    console.error('Save quote error:', error);
    return NextResponse.json(
      { error: '报价保存失败' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    const result = await getQuotesByPage(page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get quotes error:', error);
    return NextResponse.json(
      { error: '获取报价失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteNumberParam = searchParams.get('quoteNumber');
    const quoteNumber = parseInt(quoteNumberParam);
    
    console.log('Delete request - raw param:', quoteNumberParam, 'parsed:', quoteNumber);
    
    if (!quoteNumber || isNaN(quoteNumber)) {
      console.log('Invalid quote number provided');
      return NextResponse.json(
        { error: `缺少有效的报价单号码，收到：${quoteNumberParam}` },
        { status: 400 }
      );
    }
    
    const success = await deleteQuote(quoteNumber);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: '报价单删除成功'
      });
    } else {
      return NextResponse.json(
        { error: '报价单不存在或删除失败' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Delete quote error:', error);
    return NextResponse.json(
      { error: '删除报价失败' },
      { status: 500 }
    );
  }
} 