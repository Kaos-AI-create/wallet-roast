import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Keep your existing externals
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Explicitly ignore the react-native storage module
    config.resolve.alias["@react-native-async-storage/async-storage"] = false;
    
    return config;
  },
};

export default nextConfig;