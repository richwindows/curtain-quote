/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用API路由的缓存
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  // 配置webpack以排除服务器端依赖
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 在客户端构建中排除这些包
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
      
      // 排除puppeteer相关包
      config.externals = [
        ...config.externals,
        'puppeteer',
        'puppeteer-core',
        '@sparticuz/chromium',
      ];
      
      // 添加模块规则来忽略puppeteer相关文件
      config.module.rules.push({
        test: /node_modules[\\\/](puppeteer|puppeteer-core|@sparticuz[\\\/]chromium)/,
        use: 'null-loader'
      });
    }
    return config;
  },
};

module.exports = nextConfig;