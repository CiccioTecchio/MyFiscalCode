import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel genera autonomamente gli artefatti di deploy. Next.js 16.3 non
  // genera next-server.js.nft.json quando usa l'adapter di Vercel, mentre il
  // finalizzatore standalone prova ancora a leggerlo.
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
