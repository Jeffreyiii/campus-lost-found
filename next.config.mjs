/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许前端跨域请求 Flask 后端（开发环境）
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
