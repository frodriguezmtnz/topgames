import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // 'unsafe-inline' para script/style: necesario para el script del theme y los
  // estilos inline que inyecta Next.js. No hay scripts de terceros en el DOM.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inyecta scripts inline (theme + runtime); el SVG del logo usa data:.
      // 'unsafe-eval' SOLO en dev: React lo usa para debug (error stacks). No va en prod.
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      // Portadas y assets vienen de hosts externos (Steam CDN, etc).
      "img-src 'self' data: blob: https:",
      // SWR (fetch /api/*) y beacons de Vercel Analytics.
      "connect-src 'self' https://*.vercel-analytics.com https://*.vercel-insights.com",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  images: {
    // Portadas y backgrounds vienen de la CDN de RAWG. Con `unoptimized` se sirven
    // tal cual; este remotePatterns permite usar el optimizador de Next si se quita
    // unoptimized en el futuro.
    remotePatterns: [
      { protocol: "https", hostname: "media.rawg.io", pathname: "/media/**" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;