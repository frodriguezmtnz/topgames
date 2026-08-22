// Constantes de negocio del ranking (mismas reglas que outbid.lol).

export const MIN_BID_CENTS = 500; // $5 minimo
export const MAX_BID_CENTS = 99999900; // $999,999 maximo
export const OUTBID_STEP_CENTS = 100; // $1 por escalon
export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// Dominios / protocolos no permitidos en el board (chats, NSFW, etc).
export const BLOCKED_HOSTS = [
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
  "onlyfans.com",
  "patreon.com",
];

export const BLOCKED_TLDS = ["onion"];