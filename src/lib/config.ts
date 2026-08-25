export const APP_URL = (process.env.APP_URL ?? "http://localhost:3000")
  .trim()
  .replace(/\/+$/, "");
