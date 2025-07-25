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
          location: quoteData.location || '',
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
      
      const response = NextResponse.json({
        success: true,
        quoteNumber: quoteNumber,
        totalPrice: totalPrice,
        itemCount: results.length,
        timestamp: new Date().toISOString()
      });
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      response.headers.set('Surrogate-Control', 'no-store');
      
      return response;
    } else {
      // 单item模式（向后兼容）
      const requiredFields = ['product', 'valance', 'valance_color', 'bottom_rail', 'control', 'fabric', 'quantity'];
      
      for (const field of requiredFields) {
        if (!quoteData[field]) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      }
      
      // 验证尺寸字段（至少需要一组有效的尺寸数据）
      const hasInchData = quoteData.width_inch && quoteData.height_inch;
      const hasMeterData = quoteData.width_m && quoteData.height_m;
      
      if (!hasInchData && !hasMeterData) {
        return NextResponse.json(
          { error: 'Missing dimension data: need either inch data or meter data' },
          { status: 400 }
        );
      }

      const result = await saveQuote(quoteData);
      const totalPrice = quoteData.unitPrice * parseInt(quoteData.quantity);
      
      const response = NextResponse.json({
        success: true,
        quoteNumber: result.quoteNumber,
        totalPrice: totalPrice,
        timestamp: new Date().toISOString()
      });
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      response.headers.set('Surrogate-Control', 'no-store');
      
      return response;
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
    
    // 创建响应并添加强制不缓存的头
    const response = NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
      _cacheBuster: Date.now()
    });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Vary', 'Authorization, Accept-Encoding');
    response.headers.set('Last-Modified', new Date().toUTCString());
    
    return response;
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
    
    if (!quoteNumber || isNaN(quoteNumber)) {
      return NextResponse.json(
        { error: `缺少有效的报价单号码，收到：${quoteNumberParam}` },
        { status: 400 }
      );
    }
    
    const success = await deleteQuote(quoteNumber);
    
    if (success) {
      const response = NextResponse.json({
        success: true,
        message: '报价单删除成功',
        timestamp: new Date().toISOString()
      });
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      response.headers.set('Surrogate-Control', 'no-store');
      
      return response;
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

// 强制动态渲染，禁用所有缓存
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;