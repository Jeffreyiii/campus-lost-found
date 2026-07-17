/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Vercel 部署：API routes 内置处理，无需代理到 Flask
};

export default nextConfig;
