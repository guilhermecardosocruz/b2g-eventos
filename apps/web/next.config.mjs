import createNextPWA from "@ducanh2912/next-pwa";

/** @type {import("next").NextConfig} */
const baseConfig = {
experimental: {
appDir: true
}
};

const withPWA = createNextPWA({
dest: "public",
disable: process.env.NODE_ENV === "development",
register: true,
skipWaiting: true,
cacheOnFrontEndNav: true,
aggressiveFrontEndNavCaching: true,
reloadOnOnline: true,
fallbacks: {
document: "/offline"
}
});

const nextConfig = withPWA(baseConfig);

export default nextConfig;
