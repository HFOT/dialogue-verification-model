import type { NextConfig } from 'next';

// GitHub Pages はリポジトリ名のサブパス配下で配信されるため、
// Pages 向けビルドの時だけ basePath を付ける。
// 通常の dev / Cloudflare 向けビルドは従来どおりルート配信のまま。
const basePath = process.env.PAGES_BASE_PATH || undefined;

const nextConfig: NextConfig = basePath ? { basePath } : {};

export default nextConfig;
