/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "cpu-features": "commonjs cpu-features",
        ssh2: "commonjs ssh2",
        "ssh2-sftp-client": "commonjs ssh2-sftp-client",
      });
    }
    return config;
  },
};

export default nextConfig;

