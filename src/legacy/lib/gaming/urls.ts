// Utilidades de URLs: normalizacion y key canonica de cada juego.

/**
 * keyForUrl genera la "key" canonica de un juego: host + path en minusculas
 * y sin query params (como hace outbid.lol). Sirve para que dos entradas que
 * apuntan al mismo juego compartan bid.
 */
export function keyForUrl(raw: string): string {
  const u = new URL(raw);
  u.hash = "";
  u.search = "";
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const path = u.pathname.replace(/\/+$/, "").toLowerCase();
  return `${host}${path}`;
}

/** keyForUrl segura: devuelve la key canonica, o null si la URL no es valida. */
export function safeKeyForUrl(raw: string): string | null {
  try {
    return keyForUrl(raw);
  } catch {
    return null;
  }
}

/** Valida la URL de entrada y devuelve la URL canonica ya limpia. */
export function cleanUrl(raw: string): { url: string; key: string } {
  const u = new URL(raw);
  u.hash = "";
  u.search = "";
  u.pathname = u.pathname.replace(/\/+$/, "");
  return { url: u.toString(), key: keyForUrl(u.toString()) };
}

export function isValidHttps(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}