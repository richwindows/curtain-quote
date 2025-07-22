import './globals.css'
import UserNav from './components/UserNav'

export const metadata = {
  title: '窗帘报价管理系统',
  description: '窗帘报价后台管理',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen bg-gray-100">
          {/* 顶部导航栏 */}
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    窗帘报价管理系统
                  </h1>
                </div>
                <div className="flex items-center space-x-1">
                  <a 
                    href="/" 
                    className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    创建报价
                  </a>
                  <a 
                    href="/quotes" 
                    className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    报价历史
                  </a>
                  <a 
                    href="/config" 
                    className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    系统配置
                  </a>
                  <div className="border-l border-gray-200 ml-4 pl-4">
                    <UserNav />
                  </div>
                </div>
              </div>
            </div>
          </nav>
          
          {/* 主要内容区域 */}
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}