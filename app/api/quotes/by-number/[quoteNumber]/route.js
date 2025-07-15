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
    
    // 添加时间戳确保数据新鲜度
    const responseData = {
      data: quoteDetails,
      timestamp: new Date().toISOString(),
      _cacheBuster: Date.now()
    };
    
    // 创建响应并添加强化的Vercel缓存控制头
    const response = NextResponse.json(quoteDetails);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    response.headers.set('X-Accel-Expires', '0');
    response.headers.set('Vary', 'Authorization, Accept-Encoding');
    response.headers.set('Last-Modified', new Date().toUTCString());
    response.headers.set('ETag', `"${Date.now()}"`);
    
    return response;
  } catch (error) {
    console.error('Get quote details error:', error);
    return NextResponse.json(
      { error: '获取报价详情失败' },
      { status: 500 }
    );
  }
}

// 添加强制不缓存的导出配置
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0; 