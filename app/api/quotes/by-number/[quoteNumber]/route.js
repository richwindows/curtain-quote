import { NextResponse } from 'next/server';
import { getQuoteDetails } from '../../../../../lib/database';

export async function GET(request, { params }) {
  try {
    const quoteNumber = parseInt(params.quoteNumber);
    
    if (!quoteNumber) {
      return NextResponse.json(
        { error: '无效的报价单号码' },
        { status: 400 }
      );
    }
    
    const quoteDetails = await getQuoteDetails(quoteNumber);
    
    if (quoteDetails.length === 0) {
      return NextResponse.json(
        { error: '报价单不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(quoteDetails);
  } catch (error) {
    console.error('Get quote details error:', error);
    return NextResponse.json(
      { error: '获取报价详情失败' },
      { status: 500 }
    );
  }
} 