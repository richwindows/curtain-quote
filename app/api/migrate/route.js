import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase.js';

export async function POST(request) {
  try {
    const supabase = getSupabaseClient();
    
    // 添加installation_type列
    const { error: installationError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE quotes ADD COLUMN IF NOT EXISTS installation_type TEXT;'
    });
    
    if (installationError) {
      console.error('添加installation_type列失败:', installationError);
      // 尝试直接使用SQL查询
      const { error: directError1 } = await supabase
        .from('quotes')
        .select('installation_type')
        .limit(1);
      
      if (directError1 && directError1.code === 'PGRST116') {
        // 列不存在，需要手动添加
        return NextResponse.json({
          error: '需要手动在Supabase控制台中添加installation_type和rolling列到quotes表',
          sql: 'ALTER TABLE quotes ADD COLUMN IF NOT EXISTS installation_type TEXT; ALTER TABLE quotes ADD COLUMN IF NOT EXISTS rolling TEXT;'
        }, { status: 500 });
      }
    }
    
    // 添加rolling列
    const { error: rollingError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE quotes ADD COLUMN IF NOT EXISTS rolling TEXT;'
    });
    
    if (rollingError) {
      console.error('添加rolling列失败:', rollingError);
      // 尝试直接使用SQL查询
      const { error: directError2 } = await supabase
        .from('quotes')
        .select('rolling')
        .limit(1);
      
      if (directError2 && directError2.code === 'PGRST116') {
        // 列不存在，需要手动添加
        return NextResponse.json({
          error: '需要手动在Supabase控制台中添加installation_type和rolling列到quotes表',
          sql: 'ALTER TABLE quotes ADD COLUMN IF NOT EXISTS installation_type TEXT; ALTER TABLE quotes ADD COLUMN IF NOT EXISTS rolling TEXT;'
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: '数据库迁移完成，installation_type和rolling列已添加'
    });
    
  } catch (error) {
    console.error('数据库迁移失败:', error);
    return NextResponse.json({
      error: '数据库迁移失败',
      details: error.message,
      sql: 'ALTER TABLE quotes ADD COLUMN IF NOT EXISTS installation_type TEXT; ALTER TABLE quotes ADD COLUMN IF NOT EXISTS rolling TEXT;'
    }, { status: 500 });
  }
}