export const EMAIL_MAX = 254;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 200;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return typeof email === "string" && email.length <= EMAIL_MAX && EMAIL_RE.test(email);
}

export function isStrongPassword(pw: string): boolean {
  return (
    typeof pw === "string" &&
    pw.length >= PASSWORD_MIN &&
    pw.length <= PASSWORD_MAX
  );
}
