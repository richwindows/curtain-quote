import { NextResponse } from 'next/server';
import { getQuoteById } from '../../../../lib/database';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const quote = await getQuoteById(id);
    
    if (!quote) {
      return NextResponse.json(
        { error: '报价不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(quote);
  } catch (error) {
    console.error('获取报价失败:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
} 