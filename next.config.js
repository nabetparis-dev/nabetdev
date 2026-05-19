module.exports = {
  async redirects() {
    return [
      {
        source: "/wallet-leather",
        destination: "/category/wallets",
        permanent: true,
      },
      {
        source: "/suitcase-archives",
        destination: "/category/valises",
        permanent: true,
      },
      {
        source: "/backpack-archives",
        destination: "/category/backpacks",
        permanent: true,
      },
      {
        source: "/and-similar-archives",
        destination: "/security-bags",
        permanent: true,
      },
      {
        source: "/product/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/product-category/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/product-tag/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/shop/:path*",
        destination: "/",
        permanent: true,
      }
    ];
  },
};
