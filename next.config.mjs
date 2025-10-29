/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <--- genera la carpeta /out para S3
  images: {
    unoptimized: true, // <--- necesario porque no hay Image Optimization en S3
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
