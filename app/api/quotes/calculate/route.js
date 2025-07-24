import { NextResponse } from 'next/server';
import { calculatePrice } from '../../../../lib/pricing';

export async function POST(request) {
  try {
    const quoteData = await request.json();
    
    // 验证必填字段
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

    // 计算价格
    const price = await calculatePrice(quoteData);
    
    // 创建响应并添加强制不缓存的头
    const response = NextResponse.json({
      success: true,
      price: price
    });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
    
  } catch (error) {
    console.error('Price calculation error:', error);
    return NextResponse.json(
      { error: '价格计算失败' },
      { status: 500 }
    );
  }
}