import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["127.0.0.1", "test.localhost"], // 本機用 127.0.0.1 開網址時，開發模式也要能載入互動程式
  cacheComponents: true,
  experimental: { serverActions: { bodySizeLimit: "6mb" } }, // 大頭貼上傳上限 5MB，留一點表單空間
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
