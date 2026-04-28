import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'picsum.photos'],
    formats: ['image/avif', 'image/webp'],
  },
};

export default withNextIntl(nextConfig);
