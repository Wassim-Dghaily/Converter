/** @type {import('next').NextConfig} */
const nextConfig = {
  // The whole app is static (every page is prerendered; all conversions run client-side),
  // so we export to plain HTML/JS — no server runtime, no Netlify Blobs/Functions needed.
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
  webpack(config) {
    // jSquash and other codecs ship WebAssembly loaded asynchronously.
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    // jSquash's multi-threaded codec workers use a dynamic worker path webpack can't resolve;
    // we use the single-thread fallback, so silence the benign build warnings.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /@jsquash/ },
      /Critical dependency: the request of a dependency is an expression/,
    ];
    return config;
  },
};

export default nextConfig;
