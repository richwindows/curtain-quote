import { NextResponse } from 'next/server';
import { getQuoteDetails } from '../../../../../lib/database';

export async function GET(request, { params }) {
  try {
    console.log('API called with params:', params);
    const quoteNumber = parseInt(params.quoteNumber);
    console.log('Parsed quote number:', quoteNumber);
    
    if (!quoteNumber) {
      console.log('Invalid quote number provided');
      return NextResponse.json(
        { error: '无效的报价单号码' },
        { status: 400 }
      );
    }
    
    console.log('Calling getQuoteDetails with quote number:', quoteNumber);
    const quoteDetails = await getQuoteDetails(quoteNumber);
    console.log('Quote details from database:', quoteDetails);
    
    if (quoteDetails.length === 0) {
      console.log('No quote details found for quote number:', quoteNumber);
      return NextResponse.json(
        { error: '报价单不存在' },
        { status: 404 }
      );
    }
    
    console.log('Returning quote details:', quoteDetails);
    
    // 创建响应并添加缓存控制头
    const response = NextResponse.json(quoteDetails);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Get quote details error:', error);
    return NextResponse.json(
      { error: '获取报价详情失败' },
      { status: 500 }
    );
  }
} 