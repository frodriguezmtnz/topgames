// Constantes de negocio del ranking (mismas reglas que outbid.lol).

export const MIN_BID_CENTS = 500; // $5 minimo
export const MAX_BID_CENTS = 99999900; // $999,999 maximo
export const OUTBID_STEP_CENTS = 100; // $1 por escalon
export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// Dominios no permitidos en el board: chats, plataformas adult, shorteners, etc.
export const BLOCKED_HOSTS = [
  // Chats / invitaciones
  "discord.com",
  "discord.gg",
  "discordapp.com",
  "whatsapp.com",
  "wa.me",
  "t.me",
  "telegram.me",
  "telegram.org",
  "signal.me",
  "signaldonations.org",
  "m.me",
  "facebook.com/groups",
  "threads.net",
  "kick.com",
  "twitch.tv/directory",
  // Adulto / plataformas para adultos
  "onlyfans.com",
  "fansly.com",
  "chaturbate.com",
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "xhamster.com",
  "clips4sale.com",
  "cam4.com",
  "stripchat.com",
  "fanvue.com",
  "patreon.com",
];

// Shorteners de URLs: no se permiten; se reemplazan por su destino final.
export const BLOCKED_SHORTENERS = [
  "bit.ly",
  "tinyurl.com",
  "goo.gl",
  "t.co",
  "rebrand.ly",
  "shorturl.at",
  "cutt.ly",
  "is.gd",
  "buff.ly",
];

// Keywords NSFW que descalifican el listado (evita plataformas adultas).
export const NSFW_KEYWORDS = [
  "porn",
  "xxx",
  "nsfw",
  "adult",
  "camgirl",
  "webcam-sex",
  "escort",
  "onlyfans",
  "fansly",
  "chaturbate",
  "bdsm",
  "hentai-porn",
];

export const BLOCKED_TLDS = ["onion"];