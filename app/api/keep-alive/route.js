import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    // 简单查询保持连接活跃
    const { data, error } = await supabase
      .from('quotes')
      .select('id')
      .limit(1)
    
    if (error) throw error
    
    return Response.json({ 
      success: true, 
      message: 'Database connection kept alive',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}