import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // Browser tests build in isolation without replacing ordinary production artifacts.
  distDir: process.env.LEAD_E2E_BUILD === '1' ? '.next-e2e' : '.next',
  typescript: {
    tsconfigPath: process.env.LEAD_E2E_BUILD === '1' ? 'tsconfig.e2e.json' : 'tsconfig.json',
  },
  output: 'standalone',
  images: {
    domains: ['images.unsplash.com', 'picsum.photos'],
    formats: ['image/avif', 'image/webp'],
  },
};

export default withNextIntl(nextConfig);
