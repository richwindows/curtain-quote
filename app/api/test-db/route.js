import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

export async function GET() {
  try {
    console.log('Testing database connection...');
    const supabase = getSupabaseClient();
    
    // 获取最新的5条报价数据进行测试
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('Test query result - data:', data);
    console.log('Test query result - error:', error);
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      sampleData: data,
      count: data?.length || 0
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