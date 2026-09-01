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
      // 'unsafe-eval' y va.vercel-scripts.com SOLO en dev: React usa eval para debug
      // (error stacks), y @vercel/analytics carga en dev el script debug externo
      // (en prod usa /_vercel/insights/script.js, mismo origen). No van en prod.
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      // Portadas y backgrounds vienen de la CDN de RAWG.
      "img-src 'self' data: blob: https:",
      // SWR (fetch /api/*) y beacons de Vercel Analytics (en dev, el debug script
      // envia eventos a va.vercel-scripts.com).
      `connect-src 'self' https://*.vercel-analytics.com https://*.vercel-insights.com${isDev ? " https://va.vercel-scripts.com" : ""}`,
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