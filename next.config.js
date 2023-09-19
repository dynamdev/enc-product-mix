/** @type {import('next').NextConfig} */
const nextConfig = {
  exportPathMap: async function (defaultPathMap) {
    delete defaultPathMap['/hardhat'];
    return defaultPathMap;
  },
};

module.exports = nextConfig;
