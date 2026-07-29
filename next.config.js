// Force Node.js to resolve hostnames over IPv4 before IPv6.
// Fixes ENOTFOUND on test.api.amadeus.com in environments where
// IPv6 DNS resolution fails (common on Windows dev machines).
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
