import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const supabase = getSupabaseClient();
    
    // 由于Supabase不支持直接执行DDL，我们需要通过其他方式
    // 这里提供一个检查和说明的API
    
    return NextResponse.json({ 
      success: false,
      message: '需要在Supabase控制台手动执行以下SQL：',
      sql: [
        'ALTER TABLE quotes ALTER COLUMN width_inch DROP NOT NULL;',
        'ALTER TABLE quotes ALTER COLUMN height_inch DROP NOT NULL;',
        'ALTER TABLE quotes ALTER COLUMN width_m DROP NOT NULL;',
        'ALTER TABLE quotes ALTER COLUMN height_m DROP NOT NULL;'
      ],
      instructions: [
        '1. 登录Supabase控制台',
        '2. 进入SQL编辑器',
        '3. 执行上述SQL语句',
        '4. 或者在Table Editor中修改列的约束设置'
      ]
    });
    
  } catch (error) {
    console.error('检查约束失败:', error);
    return NextResponse.json(
      { error: '检查约束失败' },
      { status: 500 }
    );
  }
}