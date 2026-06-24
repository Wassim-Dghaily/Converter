/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Security headers applied in dev (Netlify mirrors these via netlify.toml in prod).
  // NOTE: we deliberately do NOT set a global cross-origin-isolation (COEP: require-corp)
  // policy here, because it breaks third-party resources (ads, fonts, analytics). The
  // multi-threaded ffmpeg.wasm core that needs SharedArrayBuffer will be handled with a
  // route-scoped strategy in the video/audio phases. See PROJECT_MEMORY.md §7.
  webpack(config) {
    // jSquash and other codecs ship WebAssembly loaded asynchronously.
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    // jSquash's multi-threaded codec workers use a dynamic worker path that webpack can't
    // statically resolve. We don't use the MT path (no cross-origin isolation), so the
    // single-thread fallback is used at runtime. Silence the benign build warnings.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /@jsquash/ },
      /Critical dependency: the request of a dependency is an expression/,
    ];
    return config;
  },
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
