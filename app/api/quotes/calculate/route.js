import { NextResponse } from 'next/server';
import { calculatePrice } from '../../../../lib/pricing';

export async function POST(request) {
  try {
    const quoteData = await request.json();
    
    // 验证必填字段
    const requiredFields = ['width_inch', 'height_inch', 'product', 'valance', 'valance_color', 'bottom_rail', 'control', 'fabric', 'quantity'];
    
    for (const field of requiredFields) {
      if (!quoteData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // 计算价格
    const price = calculatePrice(quoteData);
    
    return NextResponse.json({
      success: true,
      price: price
    });
    
  } catch (error) {
    console.error('Price calculation error:', error);
    return NextResponse.json(
      { error: '价格计算失败' },
      { status: 500 }
    );
  }
} 