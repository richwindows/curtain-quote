import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    // 获取最新的5条报价数据进行测试
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        code: error.code
      });
    }
    
    // 检查表结构
    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      sampleData: data,
      count: data?.length || 0,
      columns: columns,
      hasInstallationType: columns.includes('installation_type'),
      hasRolling: columns.includes('rolling')
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}