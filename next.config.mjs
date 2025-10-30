/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // genera /out para S3
  images: {
    unoptimized: true, // necesario para <Image /> en S3
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
