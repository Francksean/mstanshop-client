import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Uncomment and adjust once the real MSTANSHOP API image host is known:
      // { protocol: "https", hostname: "api.mstanshop.example.com", pathname: "/uploads/**" },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
