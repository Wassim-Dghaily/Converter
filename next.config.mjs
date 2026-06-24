/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Security headers applied in dev (Netlify mirrors these via netlify.toml in prod).
  // NOTE: we deliberately do NOT set a global cross-origin-isolation (COEP: require-corp)
  // policy here, because it breaks third-party resources (ads, fonts, analytics). The
  // multi-threaded ffmpeg.wasm core that needs SharedArrayBuffer will be handled with a
  // route-scoped strategy in the video/audio phases. See PROJECT_MEMORY.md §7.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
